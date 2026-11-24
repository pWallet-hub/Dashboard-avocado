import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../../components/Profile/UserProfile';
import { getProfile } from '../../services/authService';

/** Admin profile: thin wrapper around the shared UserProfile component. */
export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <UserProfile
      user={user}
      onClose={() => navigate('/dashboard/admin')}
      onUpdate={setUser}
    />
  );
}
