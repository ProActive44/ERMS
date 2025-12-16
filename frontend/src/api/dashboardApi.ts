import api from './axios';

interface StatusCount {
  _id: string;
  count: number;
}

export interface DashboardStats {
  employees: {
    total: number;
    active: number;
    byDepartment: StatusCount[];
    byStatus: StatusCount[];
  };
  attendance: {
    todayPresent: number;
    todayAbsent: number;
    attendanceRate: number;
    byStatus: StatusCount[];
  };
  leaves: {
    pending: number;
    approved: number;
    rejected: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    byStatus: StatusCount[];
  };
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const [employeeStats, attendanceStats, leaveStats, projectStats] = await Promise.all([
      api.get('/employees/stats'),
      api.get('/attendance/stats'),
      api.get('/leaves/stats'),
      api.get('/projects/stats'),
    ]);

    const findCount = (arr: StatusCount[], id: string): number => 
      arr?.find((s) => s._id === id)?.count || 0;

    return {
      employees: {
        total: employeeStats.data.data.totalCount[0]?.total || 0,
        active: findCount(employeeStats.data.data.statusCount, 'Active'),
        byDepartment: employeeStats.data.data.departmentCount || [],
        byStatus: employeeStats.data.data.statusCount || [],
      },
      attendance: {
        todayPresent: attendanceStats.data.data.todayStats?.present || 0,
        todayAbsent: attendanceStats.data.data.todayStats?.absent || 0,
        attendanceRate: attendanceStats.data.data.attendanceRate || 0,
        byStatus: attendanceStats.data.data.statusCount || [],
      },
      leaves: {
        pending: findCount(leaveStats.data.data.statusCount, 'Pending'),
        approved: findCount(leaveStats.data.data.statusCount, 'Approved'),
        rejected: findCount(leaveStats.data.data.statusCount, 'Rejected'),
      },
      projects: {
        total: projectStats.data.data.totalProjects || 0,
        active: projectStats.data.data.activeProjects || 0,
        completed: projectStats.data.data.completedProjects || 0,
        byStatus: projectStats.data.data.projectsByStatus || [],
      },
    };
  },
};
