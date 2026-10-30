import React from 'react';

const Downloads = () => {
  // List of download links
  const downloads = [
    { name: 'AIPA Equipment Standards 2022', link: '/downloads/aipa-equipment-standards-2022.pdf' },
    { name: 'AIPA Court Surface Standards 2024', link: '/downloads/aipa-court-surface-standards-2024.pdf' },
    { name: 'AIPA Court Lighting Standards 2024', link: '/downloads/aipa-court-lighting-standards-2024.pdf' },
    // { name: 'UWPF Equipment Standards 2023', link: '/downloads/uwpf-equipment-standards-2023.pdf' },
    // { name: 'UWPF Wheelchair Standards 2024', link: '/downloads/uwpf-wheelchair-standards-2024.pdf' },
    // { name: 'UWPF Court Lighting Standards 2024', link: '/downloads/uwpf-court-lighting-standards-2024.pdf' },
    // { name: 'UWPF Court Surface Standards 2024', link: '/downloads/uwpf-court-surface-standards-2024.pdf' },
  ];

  return (
    <div className=" py-10 px-6 flex flex-col items-center ">
      <div className="w-full max-w-5xl">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-600 mb-6">
          Downloads
        </h1>

        {/* Downloads List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {downloads.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-blue-100 text-blue-800 font-semibold p-4 rounded-lg shadow-md transition"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Downloads;
