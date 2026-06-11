import React, { useState, useMemo } from 'react'
import type { ScoredTeam } from '@/lib/teambuilder/types'
import { TeamCard } from './TeamCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TeamResultsProps {
  teams: ScoredTeam[]
}

export function TeamResults({ teams }: TeamResultsProps) {
  const [activeTab, setActiveTab] = useState<string>('meta')

  const metaTeams = useMemo(() => teams.filter(t => t.category === 'meta'), [teams])
  const nicheTeams = useMemo(() => teams.filter(t => t.category === 'niche'), [teams])
  const f2pTeams = useMemo(() => teams.filter(t => t.category === 'f2p'), [teams])
  const allTeams = useMemo(() => [...teams], [teams])

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 px-4 border border-dashed rounded-xl border-white/10 text-muted-foreground">
        Tidak ditemukan kombinasi tim yang valid. <br/>
        Pastikan Anda memiliki minimal 4 karakter dari game ini di Roster Anda, termasuk setidaknya 1 DPS/Sub-DPS.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/30">
          <TabsTrigger value="meta">Meta ({metaTeams.length})</TabsTrigger>
          <TabsTrigger value="niche">Niche ({nicheTeams.length})</TabsTrigger>
          <TabsTrigger value="f2p">F2P Friendly ({f2pTeams.length})</TabsTrigger>
          <TabsTrigger value="all">Semua ({allTeams.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meta" className="mt-6">
          <TeamGrid teams={metaTeams.slice(0, 10)} fallbackMsg="Tidak ada tim yang masuk kategori Meta kuat." />
        </TabsContent>
        <TabsContent value="niche" className="mt-6">
          <TeamGrid teams={nicheTeams.slice(0, 10)} fallbackMsg="Tidak ada tim Niche dengan sinergi unik yang terdeteksi." />
        </TabsContent>
        <TabsContent value="f2p" className="mt-6">
          <TeamGrid teams={f2pTeams.slice(0, 10)} fallbackMsg="Tidak ada tim dominan 4★ / F2P yang valid." />
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <TeamGrid teams={allTeams.slice(0, 30)} fallbackMsg="Tidak ada tim." />
          {allTeams.length > 30 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Menampilkan 30 kombinasi teratas dari total {allTeams.length} tim yang valid.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TeamGrid({ teams, fallbackMsg }: { teams: ScoredTeam[], fallbackMsg: string }) {
  if (teams.length === 0) {
    return <div className="text-center py-12 text-sm text-muted-foreground bg-card/10 rounded-xl border border-white/5">{fallbackMsg}</div>
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team, idx) => (
        <TeamCard key={idx} teamData={team} />
      ))}
    </div>
  )
}
