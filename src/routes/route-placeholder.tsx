interface RoutePlaceholderProps {
  title: string;
}

export function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <main>
      <h1>{title}</h1>
      <p>Estrutura técnica da página.</p>
    </main>
  );
}
