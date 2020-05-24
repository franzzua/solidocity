import "jest";
import {AppContainer} from "../container";
import {ProfileRepository} from "@infr";

const profileRepository = AppContainer.get<ProfileRepository>(ProfileRepository);

it('should has profile', async () => {
    const profile = await profileRepository.GetProfile();
    console.log(profile);
    expect(profile?.webId).not.toBe(null);
}, 20000);
