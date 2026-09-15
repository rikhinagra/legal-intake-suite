// Shared Data Layer and Utilities for Legal Intake Suite
const STORAGE_KEY = 'kr_intake_leads_v1';

// Initial realistic mock data
const INITIAL_LEADS = [
  {
    id: "LEAD-1001",
    createdAt: "2026-08-20T14:32:00Z",
    status: "verified", // 'pending' | 'verified' | 'followup' | 'rejected'
    priority: "high", // 'low' | 'medium' | 'high'
    basicInfo: {
      caseType: "Automobile Accident",
      occupation: "Warehouse Associate",
      hasAttorney: "No",
      answeringAgent: "Alex Rivera"
    },
    contactInfo: {
      firstName: "Maria",
      lastName: "Lopez",
      email: "maria.lopez@email.com",
      phone: "(213) 555-0192",
      bestTimeToCall: "Weekdays after 5pm",
      mailingState: "California",
      mailingCity: "Los Angeles",
      mailingZip: "90012",
      address: "742 Evergreen Terrace, Apt 3B"
    },
    accidentDetails: {
      accidentDate: "2026-08-18",
      accidentTime: "08:45 AM",
      description: "Rear-ended at a red light on Main St & 5th Avenue. Other driver was speeding, ran the red light, and slammed into my Honda Civic. Police report #CA-9021-X was filed at the scene. Paramedics examined me on site."
    },
    injuredPeople: [
      {
        firstName: "Maria",
        lastName: "Lopez",
        injuryDescription: "Severe whiplash, acute lumbar disc herniation, persistent numbness in right leg and severe migraine headaches."
      },
      {
        firstName: "Sofia",
        lastName: "Lopez",
        injuryDescription: "Contusions and seatbelt bruising on shoulder and chest, emotional distress."
      }
    ],
    additionalInfo: {
      notes: "State Farm insurance policy #SF-98442-01. Other driver admitted fault to the responding officer. Photos of damaged rear bumper and intersection traffic cams available."
    },
    agentReview: {
      agentName: "Marcus Vance (Senior Intake Lead)",
      reviewedAt: "2026-08-20T16:15:00Z",
      callStatus: "Connected & Verified",
      callDuration: "14 mins",
      isAuthentic: true,
      checklist: {
        idVerified: true,
        solValid: true,
        noPriorAttorney: true,
        treatmentDocumented: true,
        liabilityClear: true
      },
      agentMessage: "Spoke with Maria directly for 14 minutes. Very coherent, credible, and distressed. She already received initial MRI scans at Cedars Sinai confirming L4-L5 disc protrusion. Defendant vehicle was a commercial plumbing truck (clear deep pocket/commercial policy). Highly genuine case with high damages. Recommend fast-track retainer agreement.",
      estimatedViability: "5/5 - High Viability"
    },
    lawFirmAction: {
      status: "Retained",
      assignedAttorney: "Rachel Zimmerman, Esq.",
      notes: "Retainer agreement signed digitally on Aug 21. Letters of representation dispatched to insurer."
    }
  },
  {
    id: "LEAD-1002",
    createdAt: "2026-08-22T09:15:00Z",
    status: "pending",
    priority: "medium",
    basicInfo: {
      caseType: "Automobile Accident",
      occupation: "Software Engineer",
      hasAttorney: "No",
      answeringAgent: "Online Direct"
    },
    contactInfo: {
      firstName: "David",
      lastName: "Miller",
      email: "dmiller.tech@gmail.com",
      phone: "(415) 555-7381",
      bestTimeToCall: "Anytime mornings 9am-12pm",
      mailingState: "California",
      mailingCity: "San Francisco",
      mailingZip: "94107",
      address: "1284 Market Street, Suite 400"
    },
    accidentDetails: {
      accidentDate: "2026-08-21",
      accidentTime: "06:15 PM",
      description: "Sideswiped on Highway 101 South near Cesar Chavez exit. SUV made an unsafe lane change into my vehicle causing me to spin into guardrail."
    },
    injuredPeople: [
      {
        firstName: "David",
        lastName: "Miller",
        injuryDescription: "Fractured left wrist, fractured collarbone, cervical sprain."
      }
    ],
    additionalInfo: {
      notes: "Other driver stopped, gave Geico policy details. Dashcam footage captured the collision."
    },
    agentReview: null,
    lawFirmAction: null
  },
  {
    id: "LEAD-1003",
    createdAt: "2026-08-23T11:40:00Z",
    status: "followup",
    priority: "medium",
    basicInfo: {
      caseType: "Automobile Accident",
      occupation: "Registered Nurse",
      hasAttorney: "No",
      answeringAgent: "Jordan Lee"
    },
    contactInfo: {
      firstName: "Sarah",
      lastName: "Jenkins",
      email: "sjenkins.rn@outlook.com",
      phone: "(619) 555-4920",
      bestTimeToCall: "Afternoons 2-4 PM",
      mailingState: "California",
      mailingCity: "San Diego",
      mailingZip: "92101",
      address: "550 Front Street, Unit 14B"
    },
    accidentDetails: {
      accidentDate: "2026-08-22",
      accidentTime: "02:30 PM",
      description: "T-bone accident at intersection with blinking yellow light. The other vehicle failed to yield right of way."
    },
    injuredPeople: [
      {
        firstName: "Sarah",
        lastName: "Jenkins",
        injuryDescription: "Concussion, mild traumatic brain injury symptoms, severe neck and upper back pain."
      }
    ],
    additionalInfo: {
      notes: "Paramedics transported to ER. Currently off work for 2 weeks on doctor's orders."
    },
    agentReview: {
      agentName: "Jordan Lee",
      reviewedAt: "2026-08-23T15:00:00Z",
      callStatus: "Voicemail Left",
      callDuration: "3 mins",
      isAuthentic: false,
      checklist: {
        idVerified: true,
        solValid: true,
        noPriorAttorney: true,
        treatmentDocumented: false,
        liabilityClear: false
      },
      agentMessage: "Called claimant twice at 2:15 PM and 2:50 PM. Reached voicemail and left detailed callback instructions regarding case intake. Preliminary review of accident description indicates probable liability on other party, but awaiting claimant's confirmation of ER discharge summary.",
      estimatedViability: "3/5 - Pending Contact"
    },
    lawFirmAction: null
  }
];

// Initialize Data Store
function initStorage() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
  }
}

// Get all leads
function getLeads() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    console.error("Failed to parse stored leads", e);
    return [];
  }
}

// Save a newly submitted lead
function saveLead(leadData) {
  const leads = getLeads();
  const newLead = {
    id: "LEAD-" + Math.floor(1000 + Math.random() * 9000),
    createdAt: new Date().toISOString(),
    status: "pending",
    priority: "medium",
    agentReview: null,
    lawFirmAction: null,
    ...leadData
  };
  leads.unshift(newLead);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  return newLead;
}

// Update lead (e.g. from agent review or law firm action)
function updateLead(leadId, updates) {
  const leads = getLeads();
  const index = leads.findIndex(l => l.id === leadId);
  if (index !== -1) {
    leads[index] = { ...leads[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    return leads[index];
  }
  return null;
}

// Get single lead
function getLeadById(leadId) {
  const leads = getLeads();
  return leads.find(l => l.id === leadId) || null;
}

// Reset data to initial mock
function resetLeads() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
  return INITIAL_LEADS;
}

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch (e) {
    return dateStr;
  }
}

function formatDateTime(isoStr) {
  if (!isoStr) return "N/A";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch (e) {
    return isoStr;
  }
}

// Status Badges HTML Helper
function getStatusBadge(status) {
  switch (status) {
    case 'verified':
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Genuine & Authentic
      </span>`;
    case 'pending':
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pending Agent Review
      </span>`;
    case 'followup':
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span> Needs Follow-Up
      </span>`;
    case 'rejected':
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span> Flagged / Rejected
      </span>`;
    default:
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        ${status}
      </span>`;
  }
}

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-rose-900 text-white border-rose-700';
  const icon = type === 'success' 
    ? '<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
    : '<svg class="w-5 h-5 text-rose-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${bg} transition-all duration-300 transform translate-y-2 opacity-0`;
  toast.innerHTML = `
    ${icon}
    <div class="text-sm font-medium leading-snug flex-1">${message}</div>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global Nav Bar Generator
function renderGlobalNav(activePage) {
  const navContainer = document.getElementById('global-nav-bar');
  if (!navContainer) return;

  const pages = [
    { name: '1. User Intake Form', url: 'index.html', key: 'user', badge: 'Client Facing' },
    { name: '2. Agent Verification & Call Notes', url: 'agent-review.html', key: 'agent', badge: 'Intake Staff' },
    { name: '3. Law Firm Dashboard', url: 'law-dashboard.html', key: 'law', badge: 'Legal Team' }
  ];

  const linksHtml = pages.map(p => {
    const isActive = p.key === activePage;
    return `
      <a href="${p.url}" class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }">
        <span>${p.name}</span>
        <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
          isActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
        }">${p.badge}</span>
      </a>
    `;
  }).join('');

  navContainer.innerHTML = `
    <div class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <div class="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">KR</div>
          <span class="font-semibold text-gray-900 text-sm tracking-tight">KR Legal Intake Suite</span>
          <span class="text-xs text-gray-400 border-l border-gray-200 pl-2">System Demo</span>
        </div>
        <nav class="flex items-center gap-1.5 flex-wrap">
          ${linksHtml}
        </nav>
        <div class="flex items-center gap-2">
          <button onclick="if(confirm('Reset all demo lead records?')){LegalStore.resetLeads(); location.reload();}" class="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition">
            ↻ Reset Demo Data
          </button>
        </div>
      </div>
    </div>
  `;
}

// Export functions to window
window.LegalStore = {
  getLeads,
  saveLead,
  updateLead,
  getLeadById,
  resetLeads,
  formatDate,
  formatDateTime,
  getStatusBadge,
  showToast,
  renderGlobalNav
};

// Initialize on script load
initStorage();
