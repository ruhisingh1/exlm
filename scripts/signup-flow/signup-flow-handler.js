// eslint-disable-next-line import/no-cycle
import SignupFlowDialog from './signup-flow-dialog.js';
// eslint-disable-next-line import/no-cycle
import { defaultProfileClient, isSignedInUser } from '../auth/profile.js';
import { getConfig } from '../scripts.js';

export default async function showSignupDialog() {
  if (!isSignedInUser()) {
    return;
  }

  const SIGNUP_DIALOG_TYPE = {
    INCOMPLETE_PROFILE: 'incomplete-profile',
    NEW_PROFILE: 'new-profile',
  };

  // This value is hard-coded. Using a Bulk metadata Value for this did not work due to CDN issues;
  //  some pages had the metadata while others did not.
  const { signUpFlowConfigDate, modalReDisplayDuration } = getConfig();

  const configDate = new Date(signUpFlowConfigDate);
  const profileData = await defaultProfileClient.getMergedProfile();
  const interests = profileData.interests ?? [];
  const profileTimeStamp = new Date(profileData.timestamp);
  const modalSeenInteraction = await defaultProfileClient.getLatestInteraction('modalSeen');

  const todayStartTimeStamp = new Date();
  todayStartTimeStamp.setHours(0, 0, 0, 0);

  if (modalSeenInteraction) {
    const modalSeenTimeStamp = new Date(modalSeenInteraction.timestamp);
    const pastDate = new Date(todayStartTimeStamp);
    pastDate.setDate(todayStartTimeStamp.getDate() - modalReDisplayDuration);
  
    // Display modal again if no interests and modal timestamp is older than the past date
    if (interests.length > 0) {
      SignupFlowDialog.init(SIGNUP_DIALOG_TYPE.INCOMPLETE_PROFILE);
  
      // Update modalSeen timestamp only
      const currentTimestamp = new Date().toISOString();
  
      // Fetch all interactions from the profile
      const interactions = profileData.interactions ?? [];
  
      // Find the existing modalSeen event in the interactions array
      const modalSeenEvent = interactions.find((interaction) => interaction.event === 'modalSeen');
  
      if (modalSeenEvent) {
        // Update the timestamp of the found modalSeen event
        modalSeenEvent.timestamp = currentTimestamp;
  
        // Save the updated interactions array back to the profile
        await defaultProfileClient.updateProfile('interactions', interactions);
      }
    }
  }
   else {
    // eslint-disable-next-line no-lonely-if
    if (profileTimeStamp < todayStartTimeStamp) {
      SignupFlowDialog.init(SIGNUP_DIALOG_TYPE.INCOMPLETE_PROFILE);
    } else if (profileTimeStamp >= configDate) {
      SignupFlowDialog.init(SIGNUP_DIALOG_TYPE.NEW_PROFILE);
    }
  }
}
