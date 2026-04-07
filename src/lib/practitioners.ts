// Practitioners data loader
// Since this is a Vite project, we'll use import.meta.glob to load markdown files

export interface Practitioner {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  photo: string;
  available_days: string;
  medicare_info: string;
  book_link: string;
}

// Import all practitioner markdown files
const practitionerModules = import.meta.glob('/src/content/practitioners/*.md', { 
  eager: true,
  query: '?raw'
});

function parseFrontMatter(content: string): { data: any; content: string } {
  // More flexible regex that handles different line endings and whitespace
  const frontMatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]*([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    console.error('Frontmatter regex did not match. Content start:', content.substring(0, 50));
    return { data: {}, content };
  }

  const [, frontMatter, mainContent] = match;
  const data: any = {};

  // Simple YAML parser for our specific format
  frontMatter.split('\n').forEach(line => {
    if (line.trim()) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Handle arrays (specialties)
        if (key === 'specialties') {
          data[key] = [];
          // Look for array items in subsequent lines
          const lines = frontMatter.split('\n');
          const keyIndex = lines.findIndex(l => l.includes('specialties:'));
          let i = keyIndex + 1;
          while (i < lines.length && lines[i].startsWith('  - ')) {
            const item = lines[i].substring(4).replace(/['"]/g, '').trim();
            data[key].push(item);
            i++;
          }
        } else {
          data[key] = value;
        }
      }
    }
  });

  return { data, content: mainContent.trim() };
}

export function loadPractitioners(): Practitioner[] {
  const practitioners: Practitioner[] = [];
  
  Object.entries(practitionerModules).forEach(([path, content]) => {
    // Extract the string from the module object
    const rawContent = typeof content === 'object' && content !== null 
      ? (content as any).default || String(content)
      : String(content);
    
    const filename = path.split('/').pop()?.replace('.md', '') || '';
    const { data } = parseFrontMatter(rawContent);
    
    if (data.name) {
      practitioners.push({
        id: filename,
        name: data.name || '',
        title: data.title || 'Psychologist',
        bio: data.bio || '',
        specialties: data.specialties || [],
        photo: data.photo || '',
        available_days: data.available_days || '',
        medicare_info: data.medicare_info || '',
        book_link: data.book_link || ''
      });
    }
  });
  
  return practitioners;
}
