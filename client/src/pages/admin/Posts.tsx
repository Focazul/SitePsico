import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Eye, Calendar, Tag, FileText, MoreVertical, Image, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { generateSlug } from "@/lib/slugUtils";

type PostStatus = "draft" | "published" | "scheduled";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category: string;
  tags: string[];
  status: PostStatus;
  published_at?: string;
  scheduled_at?: string;
  views: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<PostStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: "Rascunho", color: "text-gray-700", bgColor: "bg-gray-100" },
  published: { label: "Publicado", color: "text-green-700", bgColor: "bg-green-100" },
  scheduled: { label: "Agendado", color: "text-blue-700", bgColor: "bg-blue-100" },
};

const categoryOptions = [
  "Saúde Mental",
  "Ansiedade",
  "Depressão",
  "Relacionamentos",
  "Autoconhecimento",
  "Terapia Online",
  "Dicas",
];

const tagOptions = [
  "psicologia",
  "terapia",
  "ansiedade",
  "depressão",
  "autoestima",
  "relacionamentos",
  "saúde mental",
  "bem-estar",
];

export default function Posts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isNewTagDialogOpen, setIsNewTagDialogOpen] = useState(false);
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [availableTags, setAvailableTags] = useState(tagOptions);
  const [availableCategories, setAvailableCategories] = useState(categoryOptions);

  // Form state para editor
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "",
    tags: [] as string[],
    status: "draft" as PostStatus,
    scheduled_at: "",
    meta_title: "",
    meta_description: "",
  });

  // Fetch posts from API (apenas dados reais)
  const postsQuery = trpc.blog.getPosts.useQuery({
    limit: 100,
    offset: 0,
  });

  // Mutations
  const createMutation = trpc.blog.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post criado com sucesso!");
      setIsEditorOpen(false);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        cover_image: "",
        category: "",
        tags: [],
        status: "draft",
        scheduled_at: "",
        meta_title: "",
        meta_description: "",
      });
      postsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar post");
    },
  });

  const updateMutation = trpc.blog.updatePost.useMutation({
    onSuccess: () => {
      toast.success("Post atualizado com sucesso!");
      setIsEditorOpen(false);
      setEditingPost(null);
      postsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar post");
    },
  });

  const deleteMutation = trpc.blog.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deletado com sucesso!");
      setDeleteConfirmId(null);
      postsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar post");
    },
  });

  const createTagMutation = trpc.blog.createTag.useMutation({
    onSuccess: () => {
      if (newTagName && !availableTags.includes(newTagName)) {
        setAvailableTags([...availableTags, newTagName]);
      }
      toast.success("Tag criada com sucesso!");
      setIsNewTagDialogOpen(false);
      setNewTagName("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar tag");
    },
  });

  const createCategoryMutation = trpc.blog.createCategory.useMutation({
    onSuccess: () => {
      if (newCategoryName && !availableCategories.includes(newCategoryName)) {
        setAvailableCategories([...availableCategories, newCategoryName]);
      }
      toast.success("Categoria criada com sucesso!");
      setIsNewCategoryDialogOpen(false);
      setNewCategoryName("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar categoria");
    },
  });

  // Use apenas dados reais da API
  const posts: Post[] = (postsQuery.data?.posts?.length ?? 0) > 0 
    ? postsQuery.data!.posts.map(p => ({
        id: String(p.id),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || "",
        content: p.content,
        cover_image: p.coverImage || undefined,
        category: "Geral",
        tags: [],
        status: p.publishedAt ? "published" as const : "draft" as const,
        published_at: p.publishedAt?.toISOString(),
        views: 0,
        meta_title: undefined,
        meta_description: undefined,
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
      }))
    : [];

  // Filtrar posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedStatus !== "all" && post.status !== selectedStatus) return false;
      if (selectedCategory !== "all" && post.category !== selectedCategory) return false;
      if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [posts, selectedStatus, selectedCategory, searchQuery]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
  }), [posts]);

  // Handlers
  const handleNewPost = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      category: "",
      tags: [],
      status: "draft",
      scheduled_at: "",
      meta_title: "",
      meta_description: "",
    });
    setIsEditorOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.cover_image || "",
      category: post.category,
      tags: post.tags,
      status: post.status,
      scheduled_at: post.scheduled_at || "",
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
    });
    setIsEditorOpen(true);
  };

  const handleSavePost = () => {
    if (!formData.title || !formData.content) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    if (editingPost) {
      // Update existing post
      updateMutation.mutate({
        id: Number(editingPost.id),
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.cover_image,
        publishedAt: formData.status === "published" ? new Date() : undefined,
      });
    } else {
      // Create new post
      createMutation.mutate({
        title: formData.title,
        slug: formData.slug || undefined,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.cover_image || undefined,
        publishedAt: formData.status === "published" ? new Date() : undefined,
      });
    }
  };

  const handleDeletePost = (id: string) => {
    deleteMutation.mutate({ id: Number(id) });
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error("Nome da tag não pode estar vazio");
      return;
    }

    if (availableTags.includes(newTagName)) {
      toast.error("Esta tag já existe");
      return;
    }

    createTagMutation.mutate({
      name: newTagName,
      slug: generateSlug(newTagName),
    });
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Nome da categoria não pode estar vazio");
      return;
    }

    if (availableCategories.includes(newCategoryName)) {
      toast.error("Esta categoria já existe");
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName,
      slug: generateSlug(newCategoryName),
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Conteúdo</h1>
          <Button onClick={handleNewPost} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus size={20} />
            Novo Artigo
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="text-sm text-gray-600">Publicados</div>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </Card>
          <Card className="p-4 border-l-4 border-l-gray-400">
            <div className="text-sm text-gray-600">Rascunhos</div>
            <div className="text-2xl font-bold text-gray-600">{stats.drafts}</div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-400">
            <div className="text-sm text-gray-600">Agendados</div>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="text-sm text-gray-600">Visualizações</div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artigos..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PostStatus | "all")}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">Todos os Status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
              <option value="scheduled">Agendados</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">Todas as Categorias</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Posts */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Artigo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Views</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {post.cover_image ? (
                            <div className="w-16 h-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                              <img src={post.cover_image} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-12 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center">
                              <Image size={20} className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-xs">{post.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{post.category}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={statusConfig[post.status].bgColor}>
                          <span className={statusConfig[post.status].color}>
                            {statusConfig[post.status].label}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye size={14} />
                          <span>{post.views}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.status === "scheduled" && post.scheduled_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(post.scheduled_at).toLocaleDateString("pt-BR")}
                          </div>
                        ) : post.published_at ? (
                          new Date(post.published_at).toLocaleDateString("pt-BR")
                        ) : (
                          new Date(post.created_at).toLocaleDateString("pt-BR")
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPost(post)}
                            className="gap-1"
                          >
                            <Edit size={14} />
                            Editar
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                                <Eye size={14} className="mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteConfirmId(post.id)}
                                className="text-red-600"
                              >
                                <Trash2 size={14} className="mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Nenhum artigo encontrado</p>
                      <Button onClick={handleNewPost} variant="outline" className="mt-4">
                        Criar primeiro artigo
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmId && handleDeletePost(deleteConfirmId)}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Editor */}
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Editar Artigo" : "Novo Artigo"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Título e Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Título do artigo"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-do-artigo"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Resumo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Breve descrição do artigo (exibida na listagem)"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Conteúdo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva o conteúdo do artigo aqui... (suporta Markdown)"
                  rows={12}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Suporta formatação Markdown. Use **negrito**, *itálico*, [links](url), etc.
                </p>
              </div>

              {/* Imagem de Capa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Capa</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.cover_image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
                    placeholder="URL da imagem ou faça upload"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <Button variant="outline" className="gap-2">
                    <Image size={16} />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Categoria e Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="flex-1 px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Plus size={14} />
                          Nova
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Criar Nova Categoria</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nome da Categoria
                            </label>
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Ex: Dicas de Bem-estar"
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) => e.key === "Enter" && handleCreateCategory()}
                            />
                          </div>
                        </div>
                        <DialogFooter className="gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsNewCategoryDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleCreateCategory}
                            disabled={createCategoryMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {createCategoryMutation.isPending ? "Criando..." : "Criar"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as PostStatus }))}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicar Agora</option>
                    <option value="scheduled">Agendar Publicação</option>
                  </select>
                </div>
                {formData.status === "scheduled" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Publicação</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                  <span>Tags</span>
                  <Dialog open={isNewTagDialogOpen} onOpenChange={setIsNewTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1 text-blue-600 hover:text-blue-700">
                        <Plus size={14} />
                        Nova Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Tag</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Tag
                          </label>
                          <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Ex: autoestima"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === "Enter" && handleCreateTag()}
                          />
                        </div>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsNewTagDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleCreateTag}
                          disabled={createTagMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {createTagMutation.isPending ? "Criando..." : "Criar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        formData.tags.includes(tag) 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* SEO Fields */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Search size={16} />
                  SEO (Otimização para Buscadores)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Título
                      <span className="text-gray-400 font-normal ml-2">
                        ({formData.meta_title.length}/60 caracteres)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                      placeholder={formData.title || "Título para mecanismos de busca"}
                      maxLength={60}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Descrição
                      <span className="text-gray-400 font-normal ml-2">
                        ({formData.meta_description.length}/160 caracteres)
                      </span>
                    </label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                      placeholder={formData.excerpt || "Descrição que aparece nos resultados de busca"}
                      maxLength={160}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Preview de SEO */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Prévia no Google:</p>
                    <div className="space-y-1">
                      <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                        {formData.meta_title || formData.title || "Título do artigo"}
                      </div>
                      <div className="text-green-700 text-sm">
                        seusite.com.br/blog/{formData.slug || "url-do-artigo"}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {formData.meta_description || formData.excerpt || "Descrição do artigo aparecerá aqui..."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                Cancelar
              </Button>
              <Button variant="outline" className="gap-2">
                <Eye size={16} />
                Pré-visualizar
              </Button>
              <Button onClick={handleSavePost} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Check size={16} />
                {formData.status === "published" ? "Publicar" : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
