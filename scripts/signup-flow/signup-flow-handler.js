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
  const interactions = profileData.interactions ?? [];
  const profileTimeStamp = new Date(profileData.timestamp);
  const modalSeenEventIndex = interactions.findIndex((interaction) => interaction.event === 'modalSeen');
  const modalSeenInteraction = await defaultProfileClient.getLatestInteraction('modalSeen');

  const todayStartTimeStamp = new Date();
  todayStartTimeStamp.setHours(0, 0, 0, 0);

  if (modalSeenInteraction) {
    const modalSeenTimeStamp = new Date(modalSeenInteraction.timestamp);
    const pastDate = new Date(todayStartTimeStamp);
    pastDate.setDate(todayStartTimeStamp.getDate() - modalReDisplayDuration);

    // Display modal again if no interests and time since last modal shown has passed the duration
    if (interests.length === 0 && modalSeenTimeStamp < pastDate) {
      SignupFlowDialog.init(SIGNUP_DIALOG_TYPE.INCOMPLETE_PROFILE);

      // Update modalSeen timestamp
      const currentTimestamp = new Date().toISOString();
      interactions[modalSeenEventIndex].timestamp = currentTimestamp;
      // Save the updated interaction back to the profile
      await defaultProfileClient.updateProfile('interactions', interactions);
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (profileTimeStamp < todayStartTimeStamp) {
      SignupFlowDialog.init(SIGNUP_DIALOG_TYPE.INCOMPLETE_PROFILE);
    } else if (profileTimeStamp >= configDate) {
      SignupFlowDialog.init(SIGNUP_DIALOG_TYPE.NEW_PROFILE);
    }
  }
}
