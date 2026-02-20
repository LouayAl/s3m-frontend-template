import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// icons
import PeopleIcon from '@mui/icons-material/PeopleOutlineOutlined';

export default function TotalParticipantsCard({ isLoading, totalParticipants }) {
  const theme = useTheme();

  return (
    <>
      {isLoading ? (
        <TotalIncomeCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: theme.vars.palette.primary, // keep original card color
            color: theme.vars.palette.primary.light,
            overflow: 'hidden',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.vars.palette.primary[800],
              borderRadius: '50%',
              top: { xs: -85 },
              right: { xs: -95 }
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.vars.palette.primary[200],
              borderRadius: '50%',
              top: { xs: -125 },
              right: { xs: -15 },
              opacity: 0.5
            }
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Stack direction="row" sx={{ justifyContent: 'flex-start' }}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.largeAvatar,
                  borderRadius: 2,
                  bgcolor: 'primary.dark', // original avatar color
                  color: 'common.white',
                  mt: 1
                }}
              >
                <PeopleIcon fontSize="inherit" />
              </Avatar>
            </Stack>

            <Stack direction="row" sx={{ alignItems: 'center', mt: 2 }}>
              <Typography
                sx={{
                  fontSize: '2.125rem', // match TotalFormationHoursCard
                  fontWeight: 500,
                  mr: 1,
                  color: theme.vars.palette.primary.dark // text color from original
                }}
              >
                {totalParticipants?.toLocaleString() ?? 0}
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 1,
                fontSize: '1rem', // match TotalFormationHoursCard
                fontWeight: 500,
                color: theme.vars.palette.primary.dark // original subtitle color
              }}
            >
              Total des participants
            </Typography>
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalParticipantsCard.propTypes = {
  isLoading: PropTypes.bool,
  totalParticipants: PropTypes.number
};
