import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import HoursIcon from 'assets/images/icons/clock.png';

export default function TotalFormationHoursCard({ isLoading, totalHours }) {
  const theme = useTheme();

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: 'secondary.dark',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.vars.palette.secondary[800],
              borderRadius: '50%',
              top: { xs: -85 },
              right: { xs: -95 }
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.vars.palette.secondary[800],
              borderRadius: '50%',
              top: { xs: -125 },
              right: { xs: -15 },
              opacity: 0.5
            }
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.largeAvatar,
                  borderRadius: 2,
                  bgcolor: 'secondary.800',
                  mt: 1
                }}
              >
                <CardMedia
                  sx={{ width: 30, height: 30 }}
                  component="img"
                  src={HoursIcon}
                  alt="Hours"
                />
              </Avatar>
            </Stack>

            <Stack direction="row" sx={{ alignItems: 'center', mt: 2 }}>
              <Typography
                sx={{
                  fontSize: '2.125rem',
                  fontWeight: 500,
                  mr: 1
                }}
              >
                {totalHours?.toLocaleString() ?? 0} h
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 1,
                fontSize: '1rem',
                fontWeight: 500,
                color: 'secondary.200'
              }}
            >
              Total des heures de formation
            </Typography>
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalFormationHoursCard.propTypes = {
  isLoading: PropTypes.bool,
  totalHours: PropTypes.number
};
