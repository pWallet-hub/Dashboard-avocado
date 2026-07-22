import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../../components/Profile/UserProfile';
import { getProfile } from '../../services/authService';

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
      onBack={() => navigate(-1)}
      onUpdate={setUser}
    />
  );
}