import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, Divider, Button, CircularProgress } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import { getAllHelpers, Helper } from '@/lib/sheets';

interface Props {
  helper: Helper | null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  const allHelpers = await getAllHelpers();
  const helper = allHelpers.find((h) => h.id === id) || null;

  if (!helper) {
    return { notFound: true };
  }

  return {
    props: { helper },
  };
};

export default function HelperProfile({ helper }: Props) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{helper?.name}</Typography>
          <Button variant="contained" onClick={() => router.push(`/helpers/${helper?.id}/edit?returnTo=/helpers/${helper?.id}`)}>
            Edit Profile
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1"><strong>Role:</strong> {helper?.currentEmployer}</Typography>
          <Typography variant="subtitle1"><strong>Problem:</strong> {helper?.problem}</Typography>
          <Typography variant="subtitle1"><strong>Total Employers:</strong> {helper?.totalEmployers}</Typography>
          <Typography variant="subtitle1"><strong>EA Officer:</strong> {helper?.eaOfficer}</Typography>
          <Typography variant="subtitle1"><strong>Outstanding Loans:</strong> {helper?.outstandingLoan}</Typography>
        </Box>
      </Paper>
    </DashboardLayout>
  );
}
