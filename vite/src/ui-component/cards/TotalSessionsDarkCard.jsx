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
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard'; // Skeleton

// assets
import EventNoteIcon from '@mui/icons-material/EventNoteOutlined';

export default function TotalSessionsCardDark({ isLoading, totalSessions }) {
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
            bgcolor: 'primary.dark',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.vars.palette.primary[200],
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
                  bgcolor: 'primary.800',
                  mt: 1
                }}
              >
                <EventNoteIcon fontSize="inherit" />
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
                {totalSessions?.toLocaleString() ?? 0}
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: 1,
                fontSize: '1rem',
                fontWeight: 500,
                color: 'primary.200'
              }}
            >
              Total des sessions de formation
            </Typography>
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalSessionsCardDark.propTypes = {
  isLoading: PropTypes.bool,
  totalSessions: PropTypes.number
};
