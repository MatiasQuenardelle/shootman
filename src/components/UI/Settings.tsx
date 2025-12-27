'use client';

import { useState, useEffect } from 'react';
import { GameSettings } from '@/types';
import { settingsManager } from '@/lib/settingsManager';
import { audioManager } from '@/lib/audio';
import { musicManager } from '@/lib/musicManager';
import { WEAPON_SKINS } from '@/constants/game';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [settings, setSettings] = useState<GameSettings>(settingsManager.getAll());

  useEffect(() => {
    setSettings(settingsManager.getAll());
  }, []);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    settingsManager.set(key, value);
    setSettings(settingsManager.getAll());

    // Apply audio settings immediately
    if (key === 'soundMode') {
      audioManager.setSoundMode(value as 'arcade' | 'realistic');
    } else if (key === 'sfxVolume') {
      audioManager.setVolume(value as number);
    } else if (key === 'musicVolume') {
      musicManager.setVolume(value as number);
    } else if (key === 'musicEnabled') {
      musicManager.setEnabled(value as boolean);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Audio Settings */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Audio</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Sound Effect</span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSetting('soundMode', 'arcade')}
                  className={`px-3 py-1 rounded ${settings.soundMode === 'arcade' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  Arcade
                </button>
                <button
                  onClick={() => updateSetting('soundMode', 'realistic')}
                  className={`px-3 py-1 rounded ${settings.soundMode === 'realistic' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                >
                  Realistic
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">SFX Volume</span>
                <span className="text-slate-400">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.sfxVolume}
                onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Music</span>
              <button
                onClick={() => updateSetting('musicEnabled', !settings.musicEnabled)}
                className={`px-3 py-1 rounded ${settings.musicEnabled ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                {settings.musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Music Volume</span>
                <span className="text-slate-400">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.musicVolume}
                onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Controls</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Sensitivity</span>
                <span className="text-slate-400">{settings.sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.sensitivity}
                onChange={(e) => updateSetting('sensitivity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Left Hand Mode</span>
              <button
                onClick={() => updateSetting('leftHandMode', !settings.leftHandMode)}
                className={`px-3 py-1 rounded ${settings.leftHandMode ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                {settings.leftHandMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Accessibility</h3>

          <div className="space-y-4">
            <div>
              <span className="text-slate-300 block mb-2">Color Blind Mode</span>
              <div className="grid grid-cols-2 gap-2">
                {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSetting('colorBlindMode', mode)}
                    className={`px-3 py-2 rounded text-sm capitalize ${settings.colorBlindMode === mode ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    {mode === 'none' ? 'Normal' : mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">High Contrast</span>
              <button
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`px-3 py-1 rounded ${settings.highContrast ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                {settings.highContrast ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        {/* Customization */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Customization</h3>

          <div className="space-y-4">
            <div>
              <span className="text-slate-300 block mb-2">Weapon Skin</span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(WEAPON_SKINS) as Array<keyof typeof WEAPON_SKINS>).map((skin) => (
                  <button
                    key={skin}
                    onClick={() => updateSetting('weaponSkin', skin)}
                    className={`px-3 py-2 rounded text-sm flex items-center justify-center gap-1 ${settings.weaponSkin === skin ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: WEAPON_SKINS[skin].crosshairColor }}
                    />
                    {WEAPON_SKINS[skin].name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-300 block mb-2">Crosshair Style</span>
              <div className="grid grid-cols-5 gap-2">
                {(['default', 'dot', 'circle', 'triangle', 'diamond'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateSetting('crosshairStyle', style)}
                    className={`px-3 py-2 rounded text-sm capitalize ${settings.crosshairStyle === style ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gameplay */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Gameplay</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-slate-300">Limited Ammo & Reload</span>
                <p className="text-slate-500 text-sm">Require reloading when ammo runs out</p>
              </div>
              <button
                onClick={() => updateSetting('limitedAmmoEnabled', !settings.limitedAmmoEnabled)}
                className={`px-3 py-1 rounded ${settings.limitedAmmoEnabled ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                {settings.limitedAmmoEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        {/* Reset */}
        <div className="flex justify-between">
          <button
            onClick={() => {
              settingsManager.reset();
              setSettings(settingsManager.getAll());
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
          >
            Reset to Default
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
