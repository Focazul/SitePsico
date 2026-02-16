import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Save, Eye, ArrowLeft } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import { trpc } from '@/lib/trpc';
import { useSiteConfig } from '@/hooks/useSiteConfig';

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string[];
  coverImage: string;
  publishedAt: string;
}

export default function PostEditor() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { config } = useSiteConfig();
  const isEditing = !!params.slug;

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    tags: [],
    coverImage: '',
    publishedAt: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Queries
  const categoriesQuery = trpc.blog.getCategories.useQuery();
  const tagsQuery = trpc.blog.getTags.useQuery();

  // Mutations
  const createPostMutation = trpc.blog.createPost.useMutation();
  const updatePostMutation = trpc.blog.updatePost.useMutation();

  // Load post data if editing
  const postQuery = trpc.blog.getPost.useQuery(
    { slug: params.slug! },
    { enabled: isEditing }
  );

  useEffect(() => {
    if (isEditing && postQuery.data) {
      const post = postQuery.data;
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        categoryId: post.category?.id.toString() || '',
        tags: post.tags?.map(tag => tag.name) || [],
        coverImage: post.coverImage || '',
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : ''
      });
    }
  }, [isEditing, postQuery.data]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async (publish: boolean = false) => {
    setIsSaving(true);
    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        categoryId: parseInt(formData.categoryId),
        tagNames: formData.tags,
        coverImage: formData.coverImage || undefined,
        publishedAt: publish && formData.publishedAt ? new Date(formData.publishedAt) : undefined
      };

      if (isEditing) {
        await updatePostMutation.mutateAsync({
          id: postQuery.data!.id,
          ...postData
        });
      } else {
        await createPostMutation.mutateAsync(postData);
      }

      setLocation('/admin/posts');
    } catch (error) {
      console.error('Erro ao salvar post:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    // Abrir preview em nova aba
    const previewUrl = isEditing
      ? `/blog/${formData.slug}?preview=true`
      : `/blog/preview?title=${encodeURIComponent(formData.title)}&content=${encodeURIComponent(formData.content)}`;
    window.open(previewUrl, '_blank');
  };

  if (isEditing && postQuery.isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/admin/posts')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Post' : 'Novo Post'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={!formData.title || !formData.content}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave(true)}
            disabled={isSaving || !formData.title || !formData.content}
          >
            <Save className="w-4 h-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Digite o título do post"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-amigavel-do-post"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Resumo (Opcional)</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Breve descrição do post"
                  rows={3}
                />
              </div>

              <div>
                <Label>Conteúdo</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Escreva o conteúdo do seu post aqui..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesQuery.data?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="coverImage">Imagem de Capa (URL)</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <Label htmlFor="publishedAt">Data de Publicação</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Digite uma tag"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Adicionar
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>

              {tagsQuery.data && tagsQuery.data.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Tags sugeridas:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tagsQuery.data
                      .filter(tag => !formData.tags.includes(tag.name))
                      .slice(0, 5)
                      .map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => setFormData(prev => ({ ...prev, tags: [...prev.tags, tag.name] }))}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}