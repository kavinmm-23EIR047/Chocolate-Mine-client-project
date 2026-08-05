import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';

const formatDate = (value) => (value ? new Date(value).toLocaleString() : 'Not available');

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon size={17} className="text-primary mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[10px] font-black text-muted uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-heading break-words">{value || 'Not provided'}</p>
    </div>
  </div>
);

const AdminUsers = () => {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await adminService.getUser(id);
          if (mounted) setUser(response.data.data);
        } else {
          const response = await adminService.getAllUsers();
          if (mounted) setUsers(response.data.data || []);
        }
      } catch (error) {
        if (mounted) toast.error(error.response?.data?.message || 'Unable to load user details');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((item) => [item.name, item.email, item.phone].some((value) =>
      String(value || '').toLowerCase().includes(term)
    ));
  }, [search, users]);

  if (id) {
    if (loading) return <TableSkeleton rows={5} cols={2} />;
    if (!user) return <EmptyState icon={UserRound} title="User not found" message="This registered user could not be found." />;

    return (
      <div className="space-y-6 max-w-5xl">
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-heading">
          <ArrowLeft size={17} /> Back to users
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-black uppercase">
            {user.name?.charAt(0) || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-heading tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="uppercase text-[10px]">{user.role}</Badge>
              <Badge variant={user.active ? 'success' : 'danger'} className="uppercase text-[10px]">
                {user.active ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h3 className="text-sm font-black text-heading uppercase tracking-widest mb-5">Account details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DetailRow icon={Mail} label="Email" value={user.email} />
            <DetailRow icon={Phone} label="Phone" value={user.phone} />
            <DetailRow icon={ShieldCheck} label="Verification" value={user.isVerified ? 'Verified' : 'Not verified'} />
            <DetailRow icon={CalendarDays} label="Registered" value={formatDate(user.createdAt)} />
            <DetailRow icon={Clock3} label="Last active" value={formatDate(user.lastActiveAt)} />
            <DetailRow icon={ShieldCheck} label="Notifications" value={user.notificationEnabled ? 'Enabled' : 'Disabled'} />
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h3 className="text-sm font-black text-heading uppercase tracking-widest mb-5">Saved addresses ({user.addresses?.length || 0})</h3>
          {user.addresses?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((address, index) => (
                <div key={`${address._id || index}`} className="border border-border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-heading">{address.type || 'Address'}</p>
                    {address.isDefault && <Badge variant="outline" className="text-[10px]">Default</Badge>}
                  </div>
                  <p className="text-sm font-bold text-heading">{address.fullName || user.name}</p>
                  <p className="text-sm text-muted">{[address.houseNo, address.street, address.landmark, address.city, address.pincode].filter(Boolean).join(', ') || 'No address text'}</p>
                  {address.phone && <p className="text-xs text-muted">{address.phone}</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted">No saved addresses.</p>}
        </section>

        <section className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h3 className="text-sm font-black text-heading uppercase tracking-widest mb-5">Saved items</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border rounded-xl p-4">
              <p className="text-2xl font-black text-heading">{user.wishlist?.length || 0}</p>
              <p className="text-xs font-black text-muted uppercase tracking-widest">Product wishlist items</p>
            </div>
            <div className="border border-border rounded-xl p-4">
              <p className="text-2xl font-black text-heading">{user.customCakeWishlist?.length || 0}</p>
              <p className="text-xs font-black text-muted uppercase tracking-widest">Custom cake wishlist items</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-heading tracking-tight">Registered Users</h2>
          <p className="text-sm text-muted font-bold uppercase tracking-widest">Customer accounts</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or phone" className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold outline-none focus:border-primary" />
        </div>
      </div>

      {loading ? <TableSkeleton rows={6} cols={3} /> : filteredUsers.length === 0 ? (
        <EmptyState icon={Users} title="No registered users" message={search ? 'No users match this search.' : 'Registered customer accounts will appear here.'} />
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead><tr className="border-b border-border bg-border/20 text-left">
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Registered</th>
                <th className="px-6 py-4 text-xs font-black text-muted uppercase tracking-widest">Status</th>
                <th className="px-6 py-4" />
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((item) => (
                  <tr key={item._id} className="hover:bg-border/10 transition-colors">
                    <td className="px-6 py-4"><Link to={`/admin/users/${item._id}`} className="flex items-center gap-3 group"><span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black uppercase">{item.name?.charAt(0) || '?'}</span><span className="font-bold text-heading group-hover:text-primary">{item.name}</span></Link></td>
                    <td className="px-6 py-4"><p className="text-sm font-bold text-heading">{item.email}</p><p className="text-xs text-muted">{item.phone || 'No phone'}</p></td>
                    <td className="px-6 py-4 text-sm text-muted">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4"><Badge variant={item.active ? 'success' : 'danger'} className="uppercase text-[10px]">{item.active ? 'Active' : 'Disabled'}</Badge></td>
                    <td className="px-6 py-4 text-right"><Link to={`/admin/users/${item._id}`} aria-label={`View ${item.name}`} className="inline-flex p-2 text-muted hover:text-primary"><ChevronRight size={18} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
