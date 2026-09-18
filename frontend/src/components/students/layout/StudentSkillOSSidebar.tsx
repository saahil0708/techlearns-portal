'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Typography, Tooltip } from '@mui/material';

// Icons
import {
  FaTableCellsLarge,
  FaDiagramProject,
  FaBookOpen,
  FaCode,
  FaBullseye,
  FaDesktop,
  FaBuildingColumns,
  FaClock,
  FaTrophy,
  FaFileLines,
  FaBriefcase,
  FaLocationDot,
  FaCertificate,
  FaIdCard,
  FaGlobe,
  FaWandMagicSparkles,
  FaUsers,
  FaNewspaper,
  FaCircleNodes,
} from 'react-icons/fa6';

interface NavSection {
  title: string;
  items: {
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: string;
  }[];
}

const SIDEBAR_SECTIONS: NavSection[] = [
  {
    title: 'CAPABILITY',
    items: [
      {
        label: 'Dashboard',
        icon: <FaTableCellsLarge size={15} />,
        path: '/students/profile',
      },
      {
        label: 'Role Skill Graph',
        icon: <FaDiagramProject size={15} />,
        path: '/students/skill-graph',
      },
      {
        label: 'Learning Hub',
        icon: <FaBookOpen size={15} />,
        path: '/courses',
      },
      {
        label: 'Problems',
        icon: <FaCode size={15} />,
        path: '/problems',
      },
      {
        label: 'Practice Engine',
        icon: <FaBullseye size={15} />,
        path: '/practice',
      },
    ],
  },
  {
    title: 'BUILD & PROVE',
    items: [
      {
        label: 'Project Workspace',
        icon: <FaDesktop size={15} />,
        path: '/students/projects',
      },
      {
        label: 'Corporate Simulation',
        icon: <FaBuildingColumns size={15} />,
        path: '/students/simulations',
      },
      {
        label: 'Bootcamps',
        icon: <FaClock size={15} />,
        path: '/students/bootcamps',
      },
      {
        label: 'Competitions',
        icon: <FaTrophy size={15} />,
        path: '/contests',
      },
      {
        label: 'Interview Prep',
        icon: <FaFileLines size={15} />,
        path: '/students/interview-prep',
      },
    ],
  },
  {
    title: 'OPPORTUNITY',
    items: [
      {
        label: 'Career Hub',
        icon: <FaBriefcase size={15} />,
        path: '/students/career-hub',
      },
      {
        label: 'Jobs / Placements',
        icon: <FaLocationDot size={15} />,
        path: '/students/placements',
      },
      {
        label: 'Certifications',
        icon: <FaCertificate size={15} />,
        path: '/students/certifications',
      },
      {
        label: 'Skill Passport',
        icon: <FaIdCard size={15} />,
        path: '/students/skill-passport',
      },
      {
        label: 'Industry & Opportunities',
        icon: <FaGlobe size={15} />,
        path: '/students/opportunities',
      },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      {
        label: 'AI Learning Coach',
        icon: <FaWandMagicSparkles size={15} />,
        path: '/students/ai-coach',
      },
      {
        label: 'Blogs',
        icon: <FaNewspaper size={15} />,
        path: '/students/blogs',
      },
    ],
  },
];

interface StudentSkillOSSidebarProps {
  roleTarget?: string;
  semester?: string | number;
}

export default function StudentSkillOSSidebar({
  roleTarget,
  semester,
}: StudentSkillOSSidebarProps = {}) {
  const pathname = usePathname();

  const isItemActive = (path: string) => {
    if (path === '/students/profile' || path === '/students') {
      return pathname === '/students' || pathname === '/students/profile' || pathname.startsWith('/students/profile');
    }
    return pathname === path || (path !== '/' && pathname.startsWith(path));
  };

  return (
    <Box
      component="aside"
      aria-label="Techlearns SkillOS Navigation"
      sx={{
        width: 256,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: '#0E131F',
        borderRight: '1px solid #1E293B',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* 1. Header Brand Section */}
      <Box
        sx={{
          p: 2.5,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #1E293B',
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            bgcolor: '#1E293B',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #334155',
            flexShrink: 0,
          }}
        >
          <FaCircleNodes size={20} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.96rem',
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              lineHeight: 1.15,
            }}
          >
            Techlearns SkillOS
          </Typography>
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: '#94A3B8',
              fontWeight: 500,
              mt: 0.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Corporate Experience Learning
          </Typography>
        </Box>
      </Box>

      {/* 2. Scrollable Navigation Menu */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          px: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#334155',
            borderRadius: '4px',
          },
        }}
      >
        {SIDEBAR_SECTIONS.map((section) => (
          <Box key={section.title} sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                px: 1.5,
                mb: 0.4,
              }}
            >
              {section.title}
            </Typography>

            {section.items.map((item) => {
              const active = isItemActive(item.path);

              return (
                <Link
                  key={item.label}
                  href={item.path}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1.5,
                      py: 0.85,
                      borderRadius: '8px',
                      color: active ? '#FFFFFF' : '#94A3B8',
                      bgcolor: active ? '#1E293B' : 'transparent',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.84rem',
                      transition: 'all 0.15s ease',
                      border: active ? '1px solid #334155' : '1px solid transparent',
                      '&:hover': {
                        bgcolor: active ? '#1E293B' : 'rgba(30, 41, 59, 0.5)',
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: active ? '#38BDF8' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 20,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.84rem',
                        fontWeight: active ? 700 : 500,
                        color: 'inherit',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Link>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* 3. Bottom Role Target Card */}
      {Boolean(roleTarget && semester) && (
        <Box sx={{ p: 1.75, borderTop: '1px solid #1E293B', bgcolor: '#0B0F19' }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '10px',
              bgcolor: '#131B2E',
              border: '1px solid #1E293B',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#F59E0B',
                  boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)',
                }}
              />
              <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#FFFFFF', lineHeight: 1.2 }}>
                {roleTarget}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', pl: 2, fontWeight: 500 }}>
              Role Target • {typeof semester === 'number' || !/^sem/i.test(String(semester).trim()) ? `Sem ${semester}` : semester}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
