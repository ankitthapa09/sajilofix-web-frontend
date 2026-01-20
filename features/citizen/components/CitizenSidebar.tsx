import React from "react";

const nav = [
  { name: "Overview", href: "#", icon: "home", active: true },
  { name: "My Reports", href: "#", icon: "file" },
  { name: "Analytics", href: "#", icon: "chart" },
  { name: "Explore Map", href: "#", icon: "map" },
  { name: "Settings", href: "#", icon: "cog" },
];

export default function CitizenSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 px-4 py-6">
      <div className="flex items-center gap-3 mb-8">
        <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain" />
        <div>
          <div className="font-semibold text-blue-700">SajiloFix</div>
          <div className="text-sm text-gray-500">Citizen Portal</div>
        </div>
      </div>

      <nav className="space-y-2">
        {nav.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              item.active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="w-6 h-6 flex items-center justify-center text-sm">●</span>
            <span className="font-medium">{item.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
