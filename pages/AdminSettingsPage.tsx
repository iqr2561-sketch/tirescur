import React from 'react';
import AdminSettingsPageComplete from './AdminSettingsPageComplete';
import { HeroImageUpdateFunction, PhoneNumberUpdateFunction, FooterContent, FooterUpdateFunction, DealZoneConfig, DealZoneConfigUpdateFunction } from '../types';

interface AdminSettingsPageProps {
  heroImageUrl: string;
  onUpdateHeroImage: HeroImageUpdateFunction;
  whatsappPhoneNumber: string;
  onUpdatePhoneNumber: PhoneNumberUpdateFunction;
  footerContent: FooterContent;
  onUpdateFooterContent: FooterUpdateFunction;
  dealZoneConfig: DealZoneConfig;
  onUpdateDealZoneConfig: DealZoneConfigUpdateFunction;
}

const AdminSettingsPage: React.FC<AdminSettingsPageProps> = (props) => {
  return <AdminSettingsPageComplete {...props} />;
};

export default AdminSettingsPage;
