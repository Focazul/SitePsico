/**
 * SEO Components - Schema.org Markup
 * Componentes React para injetar estrutura de dados no head
 */

import React from "react";

interface SchemaProps {
  data: Record<string, any>;
}

/**
 * Componente genérico para Schema.org JSON-LD
 * Injeta um script JSON-LD no head da página
 */
export const Schema: React.FC<SchemaProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
};

/**
 * Componente para LocalBusiness Schema
 * Usado na página Home
 */
export const LocalBusinessSchema: React.FC<{
  name: string;
  description: string;
  address: string;
  telephone: string;
  email: string;
}> = ({ name, description, address, telephone, email }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description,
    url: window.location.origin,
    telephone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressCountry: "BR",
    },
    areaServed: {
      "@type": "City",
      name: "São Paulo",
    },
  };

  return <Schema data={data} />;
};

/**
 * Componente para Person Schema
 * Usado na página About
 */
export const PersonSchema: React.FC<{
  name: string;
  description: string;
  crp: string;
  image?: string;
}> = ({ name, description, crp, image }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description,
    url: window.location.origin,
    image: image || `${window.location.origin}/placeholder-photo.jpg`,
    jobTitle: "Psicólogo",
    knowsAbout: [
      "Psicoterapia",
      "Ansiedade",
      "Depressão",
      "Autoestima",
      "Relacionamentos",
    ],
    credential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: `CRP-SP ${crp}`,
      },
    ],
  };

  return <Schema data={data} />;
};

/**
 * Componente para ProfessionalService Schema
 * Usado na página Services
 */
export const ProfessionalServiceSchema: React.FC<{
  serviceName: string;
  description: string;
  provider: string;
}> = ({ serviceName, description, provider }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: serviceName,
    description,
    provider: {
      "@type": "Person",
      name: provider,
      url: window.location.origin,
    },
    areaServed: {
      "@type": "City",
      name: "São Paulo",
    },
    priceRange: "$$",
    url: `${window.location.origin}/services`,
  };

  return <Schema data={data} />;
};

/**
 * Componente para Article Schema
 * Usado em posts de blog
 */
export const ArticleSchema: React.FC<{
  headline: string;
  description: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
}> = ({ headline, description, imageUrl, datePublished, dateModified, author }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: imageUrl || `${window.location.origin}/blog-placeholder.jpg`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author,
      url: window.location.origin,
    },
    publisher: {
      "@type": "Organization",
      name: "Consultório de Psicologia",
      logo: {
        "@type": "ImageObject",
        url: `${window.location.origin}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": window.location.href,
    },
  };

  return <Schema data={data} />;
};

/**
 * Componente para FAQPage Schema
 * Usado na seção FAQ
 */
export const FAQSchema: React.FC<{
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}> = ({ faqs }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return <Schema data={data} />;
};

/**
 * Componente para BreadcrumbList Schema
 * Melhora navegação no Google Search Results
 */
export const BreadcrumbSchema: React.FC<{
  items: Array<{
    name: string;
    url: string;
  }>;
}> = ({ items }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <Schema data={data} />;
};

/**
 * Componente para Organization Schema
 * Deve estar em uma página global (ex: root layout)
 */
export const OrganizationSchema: React.FC<{
  name: string;
  description: string;
  logo?: string;
  sameAs?: string[];
}> = ({ name, description, logo, sameAs }) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${window.location.origin}/#organization`,
    name,
    description,
    url: window.location.origin,
    logo: logo || `${window.location.origin}/logo.png`,
    sameAs: sameAs || [
      "https://www.instagram.com",
      "https://www.linkedin.com",
    ],
    contact: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      telephone: "+55-11-9999-9999",
      email: "contato@example.com",
    },
  };

  return <Schema data={data} />;
};
