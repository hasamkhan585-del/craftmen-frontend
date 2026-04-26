import { getHeaderOptions } from "@/lib/acf";
import { ACFHeaderOptions } from "@/types/acf";
import HeaderClient from "./HeaderClient";

// Default fallback when ACF is not configured yet
const DEFAULT_HEADER: ACFHeaderOptions = {
  logo: {
    url: "https://craftmen.fr/demo/wp-content/uploads/2026/04/craft-man.png",
    alt: "Craft Men",
    width: 200,
    height: 60,
    sizes: {},
  },
  site_name: "CRAFT MEN",
  phone: "",
  cta: { text: "Shop Now", link: "/shop", style: "primary" },
  nav: [
    { label: "Home",    link: "/",       open_new_tab: false, highlight: false, children: [] },
    { label: "Shop",    link: "/shop",   open_new_tab: false, highlight: false, children: [] },
    { label: "Blog",    link: "/blog",   open_new_tab: false, highlight: false, children: [] },
    { label: "About",   link: "/about",  open_new_tab: false, highlight: false, children: [] },
    { label: "Contact", link: "/contact",open_new_tab: false, highlight: false, children: [] },
  ],
};

export default async function Header() {
  const options = ((await getHeaderOptions()) ?? DEFAULT_HEADER) as ACFHeaderOptions;
  return <HeaderClient options={options} />;
}
