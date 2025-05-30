import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, Divider, Button, CircularProgress } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import { getAllStaff, Staff } from '@/lib/sheets';

interface Props {
  staff: Staff | null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  const allStaff = await getAllStaff();
  const staff = allStaff.find((s) => s.id === id) || null;

  if (!staff) {
    return { notFound: true };
  }

  return {
    props: { staff },
  };
};

export default function StaffProfile({ staff }: Props) {
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
          <Typography variant="h4">{staff?.name}</Typography>
          <Button variant="contained" onClick={() => router.push(`/staff/${staff?.id}/edit?returnTo=/staff/${staff?.id}`)}>
            Edit Profile
          </Button>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1"><strong>Role:</strong> {staff?.role}</Typography>
          <Typography variant="subtitle1"><strong>Email:</strong> {staff?.email}</Typography>
          <Typography variant="subtitle1"><strong>Contact:</strong> {staff?.contact}</Typography>
          {/* You can add more fields here if needed */}
        </Box>
      </Paper>
    </DashboardLayout>
  );
}
