// ─── Shared ──────────────────────────────────────────────────────────────────

export interface ACFImage {
  url: string;
  alt: string;
  width: number;
  height: number;
  sizes: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    full?: string;
  };
}

// ─── Header & Footer ─────────────────────────────────────────────────────────

export interface ACFNavItem {
  label: string;
  link: string;
  open_new_tab: boolean;
  highlight: boolean;
  children: { label: string; link: string }[];
}

export interface ACFHeaderOptions {
  logo: ACFImage | null;
  site_name: string;
  phone: string;
  cta: { text: string; link: string; style: "primary" | "outline" | "ghost" };
  nav: ACFNavItem[];
}

export interface ACFFooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export interface ACFFooterContact {
  address: string;
  email:   string;
  phone:   string;
}

export interface ACFFooterOptions {
  logo: ACFImage | null;
  description: string;
  copyright: string;
  columns: ACFFooterColumn[];
  contact: ACFFooterContact;
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  bottom_links: { label: string; url: string }[];
}

// ─── Page response ────────────────────────────────────────────────────────────

export interface ACFPageResponse {
  id: number;
  slug: string;
  title: string;
  content: string;
  featured_image: string | null;
  seo: {
    title?: string;
    description?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical?: string;
  };
  sections: ACFSection[];
}

// ─── Section Layouts ─────────────────────────────────────────────────────────

export type ACFSection =
  | HeroSection
  | TextContentSection
  | ImageTextSection
  | ServicesGridSection
  | ProcessStepsSection
  | ReasonsGridSection
  | TestimonialsSection
  | CaseStudiesSection
  | TechStackSection
  | StatsSection
  | LatestPostsSection
  | DataPowerSection
  | CTABannerSection
  | VideoEmbedSection
  | FAQSection;

export interface HeroSection {
  layout: "hero";
  badge_text: string;
  badge_color: "pink" | "blue" | "green";
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  bg_style: "white" | "light" | "dark" | "gradient";
  image: ACFImage | null;
}

export interface TextContentSection {
  layout: "text_content";
  title: string;
  content: string;
  width: "narrow" | "full";
}

export interface ImageTextSection {
  layout: "image_text";
  image_position: "left" | "right";
  image: ACFImage | null;
  title: string;
  content: string;
  cta_text: string;
  cta_link: string;
}

export interface ServicesGridSection {
  layout: "services_grid";
  section_title: string;
  section_subtitle: string;
  services: {
    icon: string;
    title: string;
    description: string;
    image: ACFImage | null;
    link: string;
    link_text: string;
  }[];
}

export interface ProcessStepsSection {
  layout: "process_steps";
  section_title: string;
  section_subtitle: string;
  steps: {
    step_number: string;
    icon: string;
    title: string;
    description: string;
    image: ACFImage | null;
  }[];
}

export interface ReasonsGridSection {
  layout: "reasons_grid";
  section_title: string;
  section_subtitle: string;
  reasons: {
    number: string;
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface TestimonialsSection {
  layout: "testimonials";
  section_label: string;
  section_title: string;
  items: {
    quote: string;
    client_name: string;
    client_role: string;
    client_company: string;
    rating: number;
    avatar: ACFImage | null;
  }[];
}

export interface CaseStudiesSection {
  layout: "case_studies";
  section_title: string;
  section_subtitle: string;
  cases: {
    title: string;
    excerpt: string;
    industry: string;
    result: string;
    link: string;
    image: ACFImage | null;
  }[];
}

export interface TechStackSection {
  layout: "tech_stack";
  section_title: string;
  brands: { name: string; logo: ACFImage | null }[];
}

export interface StatsSection {
  layout: "stats";
  section_title: string;
  background: "white" | "light" | "dark";
  stats: { number: string; label: string; icon: string }[];
}

export interface LatestPostsSection {
  layout: "latest_posts";
  section_title: string;
  show_view_all: boolean;
  posts: {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    image_url: string | null;
    category: { name: string; slug: string } | null;
  }[];
}

export interface DataPowerSection {
  layout: "data_power";
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
}

export interface CTABannerSection {
  layout: "cta_banner";
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  bg_color: "dark-navy" | "red" | "blue" | "white";
}

export interface VideoEmbedSection {
  layout: "video_embed";
  title: string;
  video_url: string;
  poster: ACFImage | null;
}

export interface FAQSection {
  layout: "faq";
  section_title: string;
  section_subtitle: string;
  items: { question: string; answer: string }[];
}
