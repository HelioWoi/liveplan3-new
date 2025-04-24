import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';

interface Bill {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
}

const bills: Bill[] = [
  { id: '1', title: 'Insurance', dueDate: '2025-04-20', amount: 150 },
  { id: '2', title: 'Netflix', dueDate: '2025-04-24', amount: 19.99 },
  { id: '3', title: 'Phone Plan', dueDate: '2025-04-28', amount: 60 },
  { id: '4', title: 'Gym Membership', dueDate: '2025-04-30', amount: 45 }
];

export default function UpcomingBills() {
  const billsWithStatus = useMemo(() => {
    const today = new Date('2025-04-21'); // Using fixed date as per requirement
    
    return bills.map(bill => {
      const dueDate = new Date(bill.dueDate);
      const daysLeft = differenceInDays(dueDate, today);
      
      let status: 'success' | 'warning' | 'error';
      if (daysLeft > 7) {
        status = 'success';
      } else if (daysLeft > 3) {
        status = 'warning';
      } else {
        status = 'error';
      }
      
      return { ...bill, daysLeft, status };
    });
  }, []);

  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'bg-[#E6F4EA] border-l-[#34D399]';
      case 'warning':
        return 'bg-[#FFF8E1] border-l-[#F59E0B]';
      case 'error':
        return 'bg-[#FFEAEA] border-l-[#EF4444]';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] font-bold text-[#1F2533]">Upcoming Bills</h2>
        <Link to="/bills" className="text-[14px] font-medium text-[#5B3FFB]">
          See All Bills ›
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {billsWithStatus.slice(0, 4).map((bill) => (
          <div 
            key={bill.id}
            className={`relative rounded-xl p-4 bg-white shadow-md overflow-hidden border-l-4 ${getStatusColor(bill.status)}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EAE6FE] flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#5B3FFB]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1F2533]">{bill.title}</h3>
                <p className="text-[#7A7A7A] text-sm">
                  Due {format(new Date(bill.dueDate), 'MMM d')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#1F2533]">${bill.amount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}