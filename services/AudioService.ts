import { Platform } from "react-native";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";

export type RecordingResult = {
  fileUri: string;
  // For native, return RN upload descriptor { uri, name, type }
  // For web (not used here), caller can use input file
  file: any;
};

class AudioService {
  private recording: Audio.Recording | null = null;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "web") return true;
    const res = await Audio.requestPermissionsAsync();
    return res.status === "granted";
  }

  async startRecording(): Promise<void> {
    if (Platform.OS === "web") {
      throw new Error("Use file picker on web for now");
    }
    const ok = await this.requestPermissions();
    if (!ok) throw new Error("Microphone permission not granted");

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
    );
    await recording.startAsync();
    this.recording = recording;
  }

  async stopRecording(): Promise<RecordingResult> {
    if (!this.recording) {
      throw new Error("Recording not started");
    }
    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    this.recording = null;
    if (!uri) {
      throw new Error("No recording URI");
    }
    // On native, return RN file descriptor for multipart upload
    if (Platform.OS !== "web") {
      return { fileUri: uri, file: { uri, name: "recording.m4a", type: "audio/m4a" } };
    }
    // Web not used here
    return { fileUri: uri, file: null };
  }

  // Play helper (used when notification arrives)
  async playFromUrl(url: string): Promise<void> {
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    const status = (await sound.playAsync()) as AVPlaybackStatusSuccess;
    if (!status.isLoaded) {
      throw new Error("Audio failed to load");
    }
  }
}

export default new AudioService();


