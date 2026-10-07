const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5118/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('jobboard_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Something went wrong')
  return body
}

export const demoJobs = [
  { id: 1, title: 'Senior Product Designer', company: 'Northstar Labs', location: 'London, UK', type: 'Full time', mode: 'Hybrid', salary: '$95k–$120k', category: 'Design', initials: 'NL', color: '#dff4ef', posted: '2 days ago', description: 'Shape calm, human product experiences for teams around the world.' },
  { id: 2, title: 'Frontend Engineer', company: 'Paperplane', location: 'Remote', type: 'Full time', mode: 'Remote', salary: '$110k–$145k', category: 'Technology', initials: 'PP', color: '#edf0ff', posted: 'Today', description: 'Build accessible interfaces with React and a thoughtful design system.' },
  { id: 3, title: 'Growth Marketing Lead', company: 'Orbit Market', location: 'New York, US', type: 'Full time', mode: 'Hybrid', salary: '$90k–$115k', category: 'Marketing', initials: 'OM', color: '#fff0e7', posted: '3 days ago', description: 'Own creative growth experiments for a modern commerce platform.' },
  { id: 4, title: 'People Operations Partner', company: 'Clover Health', location: 'Austin, US', type: 'Full time', mode: 'On-site', salary: '$82k–$105k', category: 'People', initials: 'CH', color: '#e9f7e8', posted: '4 days ago', description: 'Create a workplace where ambitious people can do their best work.' },
  { id: 5, title: 'Product Manager, Mobile', company: 'Kite Finance', location: 'Toronto, CA', type: 'Full time', mode: 'Remote', salary: '$100k–$130k', category: 'Product', initials: 'KF', color: '#e8f5fb', posted: '5 days ago', description: 'Lead a small cross-functional team improving everyday finance.' },
  { id: 6, title: 'Data Analyst', company: 'Kindred Energy', location: 'Berlin, DE', type: 'Contract', mode: 'Hybrid', salary: '$70k–$88k', category: 'Data', initials: 'KE', color: '#f4edff', posted: '1 week ago', description: 'Turn climate and customer data into clear operational decisions.' },
]

export async function getJobs(query = '') {
  try { return await api(`/jobs${query}`) }
  catch {
    const term = new URLSearchParams(query).get('search')?.toLowerCase()
    return term ? demoJobs.filter(j => `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(term)) : demoJobs
  }
}
