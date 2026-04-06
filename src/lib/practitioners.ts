// Practitioners data loader
// Since this is a Vite project, we'll use import.meta.glob to load markdown files

export interface Practitioner {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  photo: string;
  medicare_info: string;
  book_link: string;
}

// Import all practitioner markdown files
const practitionerModules = import.meta.glob('/src/content/practitioners/*.md', { 
  eager: true,
  as: 'raw'
});

function parseFrontMatter(content: string): { data: any; content: string } {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
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
    const filename = path.split('/').pop()?.replace('.md', '') || '';
    const { data } = parseFrontMatter(content as string);
    
    if (data.name) {
      practitioners.push({
        id: filename,
        name: data.name || '',
        title: data.title || 'Psychologist',
        bio: data.bio || '',
        specialties: data.specialties || [],
        photo: data.photo || '',
        medicare_info: data.medicare_info || '',
        book_link: data.book_link || ''
      });
    }
  });
  
  return practitioners;
}