export interface Speaker {
  name: string;
  designation: string;
  company: string;
  avatarUrl: string;
}

export interface Sponsor {
  name: string;
  logoUrl: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  description: string;
  speaker?: string;
}

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  short_description: string;
  date_time: string;
  end_date_time: string;
  venue: string;
  location_coordinates?: { lat: number; lng: number };
  club_id?: string;
  club_name: string;
  banner_url: string;
  registration_limit?: number;
  registration_deadline?: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar';
  status: 'draft' | 'published' | 'archived';
  is_paid: boolean;
  price: number;
  max_team_size: number;
  speakers: Speaker[];
  sponsors: Sponsor[];
  agenda: AgendaItem[];
  approval_required?: boolean;
  visibility?: 'public' | 'college' | 'department' | 'club';
  created_at: string;
  updated_at: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  banner_url: string;
}

export const MOCK_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'ByteCraft Coding Club',
    description: 'The official computer science and programming community. We host hackathons, codathons, and weekly study groups.',
    logo_url: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100',
    banner_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800'
  },
  {
    id: 'club-2',
    name: 'Symphony Music & Arts Club',
    description: 'The creative hub of campus. Uniting musicians, painters, dancers, and actors under one artistic umbrella.',
    logo_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=100',
    banner_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800'
  },
  {
    id: 'club-3',
    name: 'Ares Athletics Club',
    description: 'Fostering sportsmanship, physical fitness, and competitive edge in football, basketball, cricket, and athletics.',
    logo_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100',
    banner_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'
  }
];

export const MOCK_EVENTS: CollegeEvent[] = [
  {
    id: 'event-1',
    title: 'TechnoHack 2026 Hackathon',
    short_description: '36-hour national level hackathon to build open-source solutions for smart cities and education.',
    description: 'TechnoHack 2026 is our flagship national-level programming event. Bring your team, code overnight, and pitch your prototypes to leading venture capitalists. Features free snacks, energy drinks, and premium swag for all participants.',
    date_time: '2026-08-14T09:00:00Z',
    end_date_time: '2026-08-15T21:00:00Z',
    venue: 'Main Seminar Hall & CSE Labs',
    location_coordinates: { lat: 19.076, lng: 72.8777 },
    club_id: 'club-1',
    club_name: 'ByteCraft Coding Club',
    banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    registration_limit: 120,
    registration_deadline: '2026-08-10T23:59:59Z',
    category: 'Technical',
    status: 'published',
    is_paid: true,
    price: 299.00,
    max_team_size: 4,
    speakers: [
      {
        name: 'Arjun Mehta',
        designation: 'Senior Staff Engineer',
        company: 'Google Cloud India',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
      },
      {
        name: 'Shreya Iyer',
        designation: 'VP of Product',
        company: 'Razorpay',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
      }
    ],
    sponsors: [
      { name: 'GitHub', logoUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=60' },
      { name: 'MongoDB', logoUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=60' }
    ],
    agenda: [
      { time: '09:00 AM', title: 'Opening Ceremony', description: 'Opening remarks from the Dean and keynote speech on Smart Cities.' },
      { time: '10:00 AM', title: 'Hacking Begins', description: 'Teams choose problem statements and start development.' },
      { time: '04:00 PM', title: 'Mentorship Round 1', description: 'Tech leads review database architecture and API connections.' },
      { time: '09:00 PM', title: 'Mid-night Pitching Practice', description: 'Optional feedback sessions on pitching slide-decks.' }
    ],
    created_at: '2026-06-15T12:00:00Z',
    updated_at: '2026-06-15T12:00:00Z'
  },
  {
    id: 'event-2',
    title: 'Spandan Cultural Night & Concert',
    short_description: 'An evening of live music, fashion shows, street play performances, and a celebrity guest concert.',
    description: 'Spandan is the annual cultural evening of CampusConnect. Witness classical and rock band performances, a stunning choreography show, and end the night dancing with a celebrity guest DJ!',
    date_time: '2026-09-05T17:00:00Z',
    end_date_time: '2026-09-05T23:30:00Z',
    venue: 'Open Air Theater (OAT)',
    location_coordinates: { lat: 19.0762, lng: 72.8778 },
    club_id: 'club-2',
    club_name: 'Symphony Music & Arts Club',
    banner_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    registration_limit: 1000,
    registration_deadline: '2026-09-04T12:00:00Z',
    category: 'Cultural',
    status: 'published',
    is_paid: false,
    price: 0,
    max_team_size: 1,
    speakers: [],
    sponsors: [
      { name: 'RedBull', logoUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=60' }
    ],
    agenda: [
      { time: '05:00 PM', title: 'Drama & Mime Act', description: 'Skit performance on environmental awareness.' },
      { time: '06:30 PM', title: 'Western Band Showdown', description: 'Live performance by top 3 college bands.' },
      { time: '08:30 PM', title: 'Celebrity DJ Segment', description: '90-minute EDM performance.' }
    ],
    created_at: '2026-06-20T10:00:00Z',
    updated_at: '2026-06-20T10:00:00Z'
  },
  {
    id: 'event-3',
    title: 'National Robotics Challenge',
    short_description: 'Construct custom micro-bots to navigate obstacle courses and compete in Robo-Wars arena.',
    description: 'Bring your designed and wired robots to prove your mechanical and hardware prowess. Obstruct, fight, and push rival bots out of the ring in the ultimate deathmatch robo-combat.',
    date_time: '2026-08-25T10:00:00Z',
    end_date_time: '2026-08-25T18:00:00Z',
    venue: 'Indoor Sports Complex',
    location_coordinates: { lat: 19.0759, lng: 72.8775 },
    club_id: 'club-1',
    club_name: 'ByteCraft Coding Club',
    banner_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    registration_limit: 50,
    registration_deadline: '2026-08-20T23:59:59Z',
    category: 'Technical',
    status: 'published',
    is_paid: true,
    price: 499.00,
    max_team_size: 3,
    speakers: [
      {
        name: 'Dr. Vikram Sen',
        designation: 'ISRO Research Fellow',
        company: 'Space Applications Center',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
      }
    ],
    sponsors: [],
    agenda: [
      { time: '10:00 AM', title: 'Robot Verification', description: 'Inspect bots for dimensional and weight limits.' },
      { time: '11:00 AM', title: 'Obstacle Race (Time Trials)', description: 'Bot navigation through mazes and mud.' },
      { time: '02:00 PM', title: 'Robo-Wars Arena', description: 'Head-to-head combat rounds.' }
    ],
    created_at: '2026-06-21T15:00:00Z',
    updated_at: '2026-06-21T15:00:00Z'
  },
  {
    id: 'event-4',
    title: 'Inter-College Basketball Championship',
    short_description: 'Standard 5v5 basketball knockout tourney representing your college or department.',
    description: 'Dribble, shoot, and defend in the premier annual inter-college 5v5 basketball tournament. Winners take home the trophy and cash prizes totaling ₹25,000.',
    date_time: '2026-10-10T08:00:00Z',
    end_date_time: '2026-10-12T17:00:00Z',
    venue: 'Outdoor Basketball Courts',
    club_id: 'club-3',
    club_name: 'Ares Athletics Club',
    banner_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    registration_limit: 16,
    registration_deadline: '2026-10-05T18:00:00Z',
    category: 'Sports',
    status: 'published',
    is_paid: false,
    price: 0,
    max_team_size: 7, // 5 + 2 substitutes
    speakers: [],
    sponsors: [],
    agenda: [
      { time: '08:00 AM', title: 'Day 1 Knockouts', description: 'First round elimination matches.' },
      { time: '10:00 AM', title: 'Day 2 Quarter Finals', description: 'Compete for the semi-final berths.' },
      { time: '03:00 PM', title: 'Grand Finale (Day 3)', description: 'Championship game followed by distribution.' }
    ],
    created_at: '2026-06-25T11:00:00Z',
    updated_at: '2026-06-25T11:00:00Z'
  },
  {
    id: 'event-5',
    title: 'Generative AI & LLM Workshop',
    short_description: 'Hands-on crash course on fine-tuning LLMs, prompt engineering, and building RAG apps with LangChain.',
    description: 'Learn how to harness generative artificial intelligence. Build applications using OpenAI APIs, Google Gemini, and open-source models like Llama. Get certificate and API credits.',
    date_time: '2026-07-20T10:00:00Z',
    end_date_time: '2026-07-20T16:00:00Z',
    venue: 'CSE Research Lab',
    club_id: 'club-1',
    club_name: 'ByteCraft Coding Club',
    banner_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
    registration_limit: 80,
    registration_deadline: '2026-07-18T18:00:00Z',
    category: 'Workshop',
    status: 'published',
    is_paid: true,
    price: 99.00,
    max_team_size: 1,
    speakers: [
      {
        name: 'Nisha Varma',
        designation: 'AI Architect',
        company: 'Tech Mahindra',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
      }
    ],
    sponsors: [],
    agenda: [
      { time: '10:00 AM', title: 'Part 1: LLM Foundations', description: 'Tokenization, attention mechanism, and model architectures.' },
      { time: '12:00 PM', title: 'Part 2: LangChain RAG App', description: 'Hands-on coding connecting files to vector databases.' },
      { time: '03:00 PM', title: 'Part 3: Model Deployment', description: 'Serve LLM wrappers using FastAPI and Streamlit.' }
    ],
    created_at: '2026-06-26T09:00:00Z',
    updated_at: '2026-06-26T09:00:00Z'
  }
];

export interface Registration {
  id: string;
  event_id: string;
  student_id: string;
  team_name?: string | null;
  team_members?: string[] | any;
  emergency_contact: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'waitlisted';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  created_at: string;
  event?: CollegeEvent;
}

export interface Ticket {
  id: string;
  registration_id: string;
  ticket_id: string;
  status: 'active' | 'used' | 'void';
  created_at: string;
  registration?: Registration;
}

export interface Certificate {
  id: string;
  registration_id: string;
  certificate_id: string;
  hash_signature: string;
  created_at: string;
  registration?: Registration;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'registration' | 'payment' | 'attendance' | 'certificate' | 'announcement';
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  order_id: string;
  transaction_id?: string;
  payment_method?: string;
  created_at: string;
  registration?: Registration;
}

export interface Settlement {
  id: string;
  total_collected: number;
  settled_amount: number;
  pending_amount: number;
  status: 'pending' | 'settled';
  settlement_date: string;
  reference_id: string;
  created_at: string;
}
