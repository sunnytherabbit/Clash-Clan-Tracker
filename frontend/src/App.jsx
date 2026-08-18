import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import MainLayout from './layouts/MainLayout'
import { RiverRaceProvider } from './context/RiverRaceProvider'
import Overview from './routes/overview'
import Participants from './routes/participants'
import Clans from './routes/clans'
import Clan from './routes/clan'
import Player from './routes/player'
import Settings from './routes/settings'

function App() {
  return (
    <RiverRaceProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" />} />
        <Route element={<MainLayout />}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/clans" element={<Clans />} />
          <Route path="/clan" element={<Clan />} />
          <Route path="/player/:tag" element={<Player />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </RiverRaceProvider>
  )
}

export default App
