import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Digite o conteúdo aqui...",
  height = 400
}: RichTextEditorProps) {
  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="w-full">
      <Editor
        apiKey="your-tinymce-api-key" // Substitua pela sua chave da API do TinyMCE (gratuita para desenvolvimento)
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help | fullscreen | code',
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #374151;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #1f2937;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            p {
              margin-bottom: 1em;
            }
            ul, ol {
              margin-bottom: 1em;
              padding-left: 2em;
            }
            blockquote {
              border-left: 4px solid #e5e7eb;
              padding-left: 1em;
              margin: 1em 0;
              font-style: italic;
              color: #6b7280;
            }
          `,
          placeholder,
          branding: false,
          promotion: false,
          contextmenu: 'link image table configurepermanentpen',
          toolbar_mode: 'sliding',
          image_advtab: true,
          image_title: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          paste_data_images: true,
          valid_elements: '*[*]',
          extended_valid_elements: 'span[*],div[*],img[*],a[*],table[*],tbody[*],thead[*],tr[*],td[*],th[*]',
          setup: (editor: any) => {
            editor.on('init', () => {
              console.log('TinyMCE initialized');
            });
          }
        }}
      />
    </div>
  );
}