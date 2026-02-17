// タイマーの作業終了音と休憩終了音を管理するカスタムフック

import { useState, useCallback, useRef, useEffect } from 'react'
import { DEFAULT_VOLUME } from '@/lib/constants' // デフォルトの音量

// 返り値の型定義からこのカスタムフックが提供する機能を推測することができる
// 作業と休憩の終了時に音声再生 管理する状態はなし
// 音量の設置（0-1） 音量をuseStateで管理
// ミュートの切り替え ミュート状態か否かをuseStateで管理
// オーディオの初期化 初期化済みか否かをuseStateで管理

// カスタムフックのロジックの組み立て方
// 1. 何を作りたいか、をリスト化
// 2. ユーザーが何をするかをリスト化
// 3. 変化する状態と必要な関数をリスト化
// 4. 画面に表示されるものをリスト化
// 5. 3. から必要な関数を定義
//    ここで定義する関数は汎用的な処理内容のもの カスタムフックの中でも使用
//    playBeep() 音のインスタンスを作成して鳴らすための関数
//    playWorkEndBeep() 作業終了音を鳴らすための関数
//    playBreakEndBeep() 休憩終了音を鳴らすための関数
// 6. カスタムフックの返り値の型定義
//    ここで定義した関数は、カスタムフックの中で関数として実装
// 7. カスタムフックの実装
//    必要な状態をuseStateで定義（3. にてリスト化済み）
//    AudioContextをuseRefで定義
//    オーディオを初期化する関数をuseCallbackで定義
//    作業終了音を再生する関数をuseCallbackで定義
//    休憩終了音を再生する関数をuseCallbackで定義
//    音量を設定する関数をuseCallbackで定義
//    ミュートを切り替える関数をuseCallbackで定義
//    クリーンアップのためのuseEffectを定義
//    返り値として、定義した関数や状態をオブジェクトで返す

// 返り値の型定義
export interface UseAudioReturn {
  /** 作業終了音を再生 */
  playWorkEndSound: () => void
  /** 休憩終了音を再生 */
  playBreakEndSound: () => void
  /** 音量（0-1） */
  volume: number
  /** ミュート状態 */
  isMuted: boolean
  /** 音量を設定 */
  setVolume: (v: number) => void
  /** ミュートを切り替え */
  toggleMute: () => void
  /** オーディオを初期化（ユーザー操作後に呼び出す） */
  initializeAudio: () => void
  /** 初期化済みかどうか */
  isInitialized: boolean
}

/**
 * ビープ音を生成して再生する
 * @param audioContext AudioContext インスタンス
 * @param frequency 周波数（Hz）
 * @param duration 再生時間（秒）
 * @param volume 音量（0-1）
 * @param type 波形タイプ
 */
function playBeep(
  audioContext: AudioContext, // AudioContext インスタンス
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine' // TypeScriptの型定義でOscillatorTypeは 'sine' | 'square' | 'sawtooth' | 'triangle' | 'custom' のいずれか
) {
  const oscillator = audioContext.createOscillator() // audioContext から音源を作る
  const gainNode = audioContext.createGain() // audioContext から音量調節器を作る

  oscillator.type = type // 波形の種類を設定
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime) // 周波数を設定
  // audioContext.currentTime は、AudioContextが生成されてからの経過時間を秒単位で表すプロパティ
  // Web Audio API は**「いつ音を鳴らすか」をこの経過時間で指定する**設計になっている

  // フェードアウト効果
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

  // 音源 → 音量調節器 → スピーカー の順につなぐ
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // 現在時刻を基準に再生開始・停止
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration)
}

/**
 * 作業終了音を再生（高めの音、2回）
 */
function playWorkEndBeep(audioContext: AudioContext, volume: number) {
  // 高めの音を2回鳴らす
  playBeep(audioContext, 880, 0.15, volume, 'sine') // まず1回目の高い音を鳴らす
  setTimeout(() => {
    playBeep(audioContext, 880, 0.15, volume, 'sine')
  }, 200) // 200ms後に2回目の高い音を鳴らす
}

/**
 * 休憩終了音を再生（低めの音、3回）
 */
function playBreakEndBeep(audioContext: AudioContext, volume: number) {
  // 低めの音を3回鳴らす
  playBeep(audioContext, 660, 0.12, volume, 'sine')
  setTimeout(() => {
    playBeep(audioContext, 660, 0.12, volume, 'sine')
  }, 150)
  setTimeout(() => {
    playBeep(audioContext, 880, 0.2, volume, 'sine')
  }, 300)
}

/**
 * 音声再生を管理するカスタムフック
 */
export function useAudio(): UseAudioReturn {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME)
  const [isMuted, setIsMuted] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)

  /**
   * オーディオを初期化
   * ユーザー操作後に呼び出す必要がある（ブラウザのオートプレイポリシー対策）
   */
  const initializeAudio = useCallback(() => {
    if (audioContextRef.current) return // すでに初期化されている場合は何もしない

    try {
      audioContextRef.current = new AudioContext() // 音自体を利用できるようにするためのオブジェクトを生成
      setIsInitialized(true)
    } catch (error) {
      console.error('オーディオの初期化に失敗:', error)
    }
  }, [])

  /**
   * 作業終了音を再生
   */
  const playWorkEndSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return

    // AudioContext が suspend 状態の場合は resume
    // ブラウザには「ユーザーが操作していないのに勝手に音を鳴らすのを防ぐ」ルール（オートプレイポリシー）があります。
    // このルールにより、AudioContext は作られた後でも、一定時間ユーザー操作がないと自動的に 'suspended'（一時停止）状態になることがあります。
    if (audioContextRef.current.state === 'suspended') { // 「一時停止中？」をチェック
      audioContextRef.current.resume() // 一時停止を解除して動作中に戻す
    }

    playWorkEndBeep(audioContextRef.current, volume)
  }, [volume, isMuted])

  /**
   * 休憩終了音を再生
   */
  const playBreakEndSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return

    // AudioContext が suspend 状態の場合は resume
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }

    playBreakEndBeep(audioContextRef.current, volume)
  }, [volume, isMuted])

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v))) // 音量は0-1の範囲に制限
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean): boolean => !prev)
  }, [])

  // クリーンアップ
  // このカスタムフックではReact が管理していないもの（API、DOM、ブラウザAPI、タイマー）に触れている
  // クリーンアップしないと、コンポーネントが画面から消えた後も処理が動き続けてしまう
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    playWorkEndSound,
    playBreakEndSound,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    initializeAudio,
    isInitialized,
  }
}
