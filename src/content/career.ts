/**
 * Career trail: one signpost per entry along the path south of the camp (Tiled object layer
 * "Trail", points in walking order). Oldest first. Entries beyond the number of points are
 * still shown on the summary page.
 *
 * Leave empty to hide the trail.
 */
export interface CareerStop {
  /** Short, e.g. "2022" or "2022–24". Shown on the signpost. */
  when: string;
  role: string;
  place: string;
  summary: string;
}

export const CAREER: CareerStop[] = [
  {
    when: '2019–20',
    role: 'Project Manager',
    place: 'PT Aspros Binareka',
    summary:
      'Led an MVP for a web platform that simplifies environmental reporting, from market research to product validation. Top 15 finalist at Technopreneur 2020.',
  },
  {
    when: '2020–22',
    role: 'Full-stack Developer',
    place: 'mentorluluskampus',
    summary:
      'Built Laravel web apps, including the platform for a national high school olympiad with 300+ participants, and moved registration and participant management online.',
  },
  {
    when: '2022–23',
    role: 'Web Developer Supervisor',
    place: 'PT Akasha Wira International Tbk',
    summary:
      'Wired Jubelio fulfillment and the WhatsApp Business API into the e-commerce stack, automating order sync and customer notifications, and built features for high-volume promos.',
  },
  {
    when: '2023–25',
    role: 'Software Engineer',
    place: 'Biteship',
    summary:
      'Built Node.js APIs behind 10,000+ daily warehouse orders at 99.8% availability, React WMS flows for picking, packing and inventory, and integrations with logistics partners.',
  },
  {
    when: '2025–now',
    role: 'Product Engineer',
    place: 'Biteship',
    summary:
      'Ship fulfillment features for 500+ warehouse operators. Cut fulfillment time 40% across 20,000+ daily transactions, led the move from DigitalOcean to AWS, and build AI-assisted task assignment and routing.',
  },
];
