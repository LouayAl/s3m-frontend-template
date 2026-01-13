//frontend-template/vite/src/views/dashboard/Default/VolumeCard.jsx
import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CardMedia from '@mui/material/CardMedia';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import TrainingIcon from 'assets/images/icons/earning.svg';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

export default function VolumeCard({ isLoading, volume }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  if (isLoading) {
    return <SkeletonEarningCard />;
  }

  return (
    <MainCard
      border={false}
      content={false}
      sx={{
        bgcolor: 'secondary.dark',
        color: '#fff',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Stack direction="row" justifyContent="space-between">
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.largeAvatar,
              borderRadius: 2,
              bgcolor: 'secondary.800',
              mt: 1
            }}
          >
            <CardMedia component="img" src={TrainingIcon} sx={{ width: 30, height: 30 }} />
          </Avatar>

          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.mediumAvatar,
              bgcolor: 'secondary.dark',
              color: 'secondary.200'
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreHorizIcon fontSize="inherit" />
          </Avatar>
        </Stack>

        <Stack direction="row" alignItems="center">
          <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75 }}>
            {volume.totalSessions}
          </Typography>
          <Avatar sx={{ bgcolor: 'secondary.200', color: 'secondary.dark', width: 24, height: 24 }}>
            <ArrowUpwardIcon fontSize="inherit" />
          </Avatar>
        </Stack>

        <Typography sx={{ color: 'secondary.200', fontWeight: 500 }}>
          Total des sessions
        </Typography>

        <Typography variant="caption" sx={{ color: 'secondary.200' }}>
          {volume.totalParticipants} participants • {volume.totalHeuresFormation} h
        </Typography>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem disabled>Export (soon)</MenuItem>
      </Menu>
    </MainCard>
  );
}

VolumeCard.propTypes = {
  isLoading: PropTypes.bool,
  volume: PropTypes.shape({
    totalSessions: PropTypes.number,
    totalParticipants: PropTypes.number,
    totalHeuresFormation: PropTypes.number
  })
};
