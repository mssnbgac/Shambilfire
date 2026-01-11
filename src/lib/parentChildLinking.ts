// Parent-Child linking system for Shambil Pride Academy
export interface ParentChildLink {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  childId: string;
  childName: string;
  childAdmissionNumber: string;
  childClass: string;
  createdAt: Date;
  updatedAt: Date;
}

const PARENT_CHILD_LINKS_KEY = 'parent_child_links';

export const getParentChildLinks = (): ParentChildLink[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(PARENT_CHILD_LINKS_KEY);
    if (stored) {
      const links = JSON.parse(stored);
      return links.map((link: any) => ({
        ...link,
        createdAt: new Date(link.createdAt),
        updatedAt: new Date(link.updatedAt)
      }));
    }
  } catch (error) {
    console.error('Error reading parent-child links:', error);
  }
  
  return [];
};

export const saveParentChildLink = (link: Omit<ParentChildLink, 'id' | 'createdAt' | 'updatedAt'>): ParentChildLink => {
  const links = getParentChildLinks();
  
  const newLink: ParentChildLink = {
    ...link,
    id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  links.push(newLink);
  
  try {
    localStorage.setItem(PARENT_CHILD_LINKS_KEY, JSON.stringify(links));
  } catch (error) {
    console.error('Error saving parent-child link:', error);
  }
  
  return newLink;
};

export const getChildrenByParent = (parentId: string): ParentChildLink[] => {
  const links = getParentChildLinks();
  return links.filter(link => link.parentId === parentId);
};

export const getParentByChild = (childId: string): ParentChildLink | null => {
  const links = getParentChildLinks();
  return links.find(link => link.childId === childId) || null;
};

export const removeParentChildLink = (linkId: string): boolean => {
  const links = getParentChildLinks();
  const filteredLinks = links.filter(link => link.id !== linkId);
  
  if (filteredLinks.length === links.length) {
    return false; // Link not found
  }
  
  try {
    localStorage.setItem(PARENT_CHILD_LINKS_KEY, JSON.stringify(filteredLinks));
    return true;
  } catch (error) {
    console.error('Error removing parent-child link:', error);
    return false;
  }
};

export const updateParentChildLink = (linkId: string, updates: Partial<ParentChildLink>): ParentChildLink | null => {
  const links = getParentChildLinks();
  const linkIndex = links.findIndex(link => link.id === linkId);
  
  if (linkIndex === -1) {
    return null;
  }
  
  const updatedLink = {
    ...links[linkIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  links[linkIndex] = updatedLink;
  
  try {
    localStorage.setItem(PARENT_CHILD_LINKS_KEY, JSON.stringify(links));
    return updatedLink;
  } catch (error) {
    console.error('Error updating parent-child link:', error);
    return null;
  }
};

// Initialize demo parent-child links
export const initializeDemoParentChildLinks = (): void => {
  const existingLinks = getParentChildLinks();
  
  if (existingLinks.length === 0) {
    const demoLinks = [
      {
        parentId: 'parent-demo-1',
        parentName: 'Mr. & Mrs. Johnson',
        parentEmail: 'parent1@example.com',
        childId: 'student-demo-1',
        childName: 'David Smith',
        childAdmissionNumber: 'SPA/2023/001',
        childClass: 'JSS 2A'
      },
      {
        parentId: 'parent-demo-2',
        parentName: 'Mr. & Mrs. Brown',
        parentEmail: 'parent2@example.com',
        childId: 'student-demo-2',
        childName: 'Sarah Johnson',
        childAdmissionNumber: 'SPA/2023/002',
        childClass: 'JSS 1B'
      }
    ];
    
    demoLinks.forEach(link => {
      saveParentChildLink(link);
    });
  }
};