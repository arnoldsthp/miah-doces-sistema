export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Não coloque Navbar aqui, pois ela já está no RootLayout (app/layout.tsx)
    <div className="w-full h-full">
      {children}
    </div>
  )
}