import * as Network from 'expo-network';

/**
 * インターネットに接続できるかを確認する（FN-02）。
 *
 * `isInternetReachable` は端末や状況によって undefined になりうるため、
 * 明示的に false のときだけ「到達不可」と判断する。
 */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return !!state.isConnected && state.isInternetReachable !== false;
  } catch (error) {
    console.warn('[network] 接続状態を取得できませんでした', error);
    return false;
  }
}
