import { useState, useMemo } from "react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: "draft" | "published";
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function Pages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    status: "draft" as "draft" | "published",
    order: 0,
  });

  // Query para buscar todas as páginas
  const { data, isLoading, refetch } = trpc.pages.getAll.useQuery();
  const pages = data?.pages || [];

  // Mutations
  const createMutation = trpc.pages.create.useMutation({
    onSuccess: () => {
      toast.success("Página criada com sucesso!");
      refetch();
      setIsEditorOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao criar página: ${error.message}`);
    },
  });

  const updateMutation = trpc.pages.update.useMutation({
    onSuccess: () => {
      toast.success("Página atualizada com sucesso!");
      refetch();
      setIsEditorOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar página: ${error.message}`);
    },
  });

  const deleteMutation = trpc.pages.delete.useMutation({
    onSuccess: () => {
      toast.success("Página deletada com sucesso!");
      refetch();
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao deletar página: ${error.message}`);
    },
  });

  const filteredPages = useMemo(() => {
    // Fix TS2769: predicate mismatch. Ensure page matches expected type from backend (which might have differing optionality)
    // The query returns { id, title, content, status, order, createdAt, updatedAt, slug, metaTitle, metaDescription }
    // We should cast it to Page or adjust Page interface if needed.
    return (pages as Page[]).filter((page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
      status: "draft",
      order: 0,
    });
    setEditingPage(null);
  };

  const handleNewPage = () => {
    resetForm();
    setIsEditorOpen(true);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      status: page.status,
      order: page.order,
    });
    setIsEditorOpen(true);
  };

  const handleSavePage = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Título e conteúdo são obrigatórios");
      return;
    }

    if (editingPage) {
      updateMutation.mutate({
        id: editingPage.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeletePage = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleTogglePublish = (page: Page) => {
    updateMutation.mutate({
      id: page.id,
      status: page.status === "published" ? "draft" : "published",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Páginas</h1>
            <p className="mt-2 text-gray-600">Gerenciar conteúdo das páginas estáticas</p>
          </div>
          <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700" onClick={handleNewPage}>
                <Plus className="h-4 w-4" />
                Nova Página
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPage ? "Editar Página" : "Nova Página"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Sobre Mim"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="metaTitle">Título Meta (SEO)</Label>
                  <Input
                    id="metaTitle"
                    placeholder="Ex: Sobre Mim - Psicóloga Maria Silva"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="mt-1"
                    maxLength={60}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.metaTitle.length}/60 caracteres
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Descrição Meta (SEO)</Label>
                  <Input
                    id="metaDescription"
                    placeholder="Ex: Conheça mais sobre mim e minha prática"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="mt-1"
                    maxLength={160}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.metaDescription.length}/160 caracteres
                  </p>
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    placeholder="Escreva o conteúdo da página..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="mt-1 min-h-[300px]"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "published" })}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicada</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700" 
                  onClick={handleSavePage}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPage ? "Atualizar" : "Criar"} Página
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar páginas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Carregando páginas...</p>
          </Card>
        )}

        {/* Pages Table */}
        {!isLoading && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Atualizado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page: Page) => (
                    <tr key={page.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{page.title}</p>
                          <p className="text-sm text-gray-500">{page.metaDescription}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-700">
                          /{page.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={page.status === "published" ? "default" : "secondary"}>
                          {page.status === "published" ? "Publicada" : "Rascunho"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(page.updatedAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(page)}
                            title={page.status === "published" ? "Despublicar" : "Publicar"}
                            disabled={updateMutation.isPending}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPage(page)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {deleteConfirmId !== page.id ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(page.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeletePage(page.id)}
                                disabled={deleteMutation.isPending}
                              >
                                Sim
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Não
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPages.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">Nenhuma página encontrada</p>
              </div>
            )}
          </Card>
        )}

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm font-medium text-gray-600">Total de Páginas</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{pages.length}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm font-medium text-gray-600">Publicadas</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {(pages as Page[]).filter((p) => p.status === "published").length}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm font-medium text-gray-600">Rascunhos</p>
              <p className="mt-2 text-2xl font-bold text-yellow-600">
                {(pages as Page[]).filter((p) => p.status === "draft").length}
              </p>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
