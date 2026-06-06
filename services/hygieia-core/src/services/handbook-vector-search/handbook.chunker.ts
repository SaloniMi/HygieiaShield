export interface HandbookChunk {
  id: string;
  title: string;
  content: string;
}

export function chunkHandbook(markdown: string): HandbookChunk[] {
  const sections = markdown.split(/^## /gm);

  return sections.filter(Boolean).map((section, index) => {
    const lines = section.split("\n");

    const title = lines[0].trim();

    return {
      id: `chunk-${index}`,
      title,
      content: section
    };
  });
}
