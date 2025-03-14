import Image from "next/image"

export function ClientsSection() {
  const clients = [
    { id: 1, name: "Cliente 1", logo: "/logo/nikon.png" },
    { id: 2, name: "Cliente 2", logo: "/logo/tigre.png" },
    { id: 3, name: "Cliente 3", logo: "/logo/vl.png" },
    { id: 4, name: "Cliente 4", logo: "/logo/ktl.jpg" },
    { id: 5, name: "Cliente 5", logo: "logo/multipoint.png" },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Nuestros Clientes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-center">
              <Image
                src={client.logo}
                alt={client.name}
                width={150}
                height={100}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 