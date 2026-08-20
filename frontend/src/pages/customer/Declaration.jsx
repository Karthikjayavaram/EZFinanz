import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BankAccount from './BankAccount';

export default function Declaration() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/customer/bank-account', { replace: true });
  }, [navigate]);

  return <BankAccount />;
}
