import PropTypes from 'prop-types';
import React from 'react';

import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

import HoursIcon from 'assets/images/icons/clock.png';
import EventNoteIcon from '@mui/icons-material/EventNoteOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlineOutlined';

function getVariantStyles(theme, variant) {
  switch (variant) {
    case 'realisee':
      return {
        bgcolor: 'secondary.dark',
        textColor: '#fff',
        subTextColor: 'secondary.200',
        circleColor: theme.vars.palette.secondary[800],
        avatarBg: 'secondary.800',
        avatarColor: '#fff'
      };
    case 'planifiee':
      return {
        bgcolor: 'primary.dark',
        textColor: '#fff',
        subTextColor: 'primary.200',
        circleColor: theme.vars.palette.primary[200],
        avatarBg: 'primary.800',
        avatarColor: '#fff'
      };
    case 'autres':
    default:
      return {
        bgcolor: theme.vars.palette.primary,
        textColor: theme.vars.palette.primary.dark,
        subTextColor: theme.vars.palette.primary.dark,
        circleColor: theme.vars.palette.primary[200],
        avatarBg: 'primary.dark',
        avatarColor: 'common.white'
      };
  }
}

export default function StatusKpiCard({ isLoading, variant, title, totalHeures, totalSessions, totalParticipants }) {
  const theme = useTheme();
  const styles = getVariantStyles(theme, variant);

  if (isLoading) return <SkeletonEarningCard />;

  return (
    <MainCard
      border={false}
      content={false}
      sx={{
        bgcolor: styles.bgcolor,
        color: styles.textColor,
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: styles.circleColor,
          borderRadius: '50%',
          top: { xs: -85 },
          right: { xs: -95 }
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: styles.circleColor,
          borderRadius: '50%',
          top: { xs: -125 },
          right: { xs: -15 },
          opacity: 0.5
        }
      }}
    >
      <Box sx={{ p: 2.25, position: 'relative', zIndex: 1 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: styles.textColor, mb: 1.5 }}>
          {title}
        </Typography>

        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar variant="rounded" sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: styles.avatarBg }}>
              <CardMedia sx={{ width: 16, height: 16 }} component="img" src={HoursIcon} alt="Heures" />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.375rem', fontWeight: 500, color: styles.textColor, lineHeight: 1.2 }}>
                {totalHeures?.toLocaleString() ?? 0} h
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: styles.subTextColor }}>Heures de formation</Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              variant="rounded"
              sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: styles.avatarBg, color: styles.avatarColor }}
            >
              <EventNoteIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.375rem', fontWeight: 500, color: styles.textColor, lineHeight: 1.2 }}>
                {totalSessions?.toLocaleString() ?? 0}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: styles.subTextColor }}>Sessions</Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              variant="rounded"
              sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: styles.avatarBg, color: styles.avatarColor }}
            >
              <PeopleIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '1.375rem', fontWeight: 500, color: styles.textColor, lineHeight: 1.2 }}>
                {totalParticipants?.toLocaleString() ?? 0}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: styles.subTextColor }}>Participants</Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </MainCard>
  );
}

StatusKpiCard.propTypes = {
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(['realisee', 'planifiee', 'autres']).isRequired,
  title: PropTypes.string,
  totalHeures: PropTypes.number,
  totalSessions: PropTypes.number,
  totalParticipants: PropTypes.number
};