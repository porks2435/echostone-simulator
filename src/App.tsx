import React, { ChangeEvent, useState } from 'react';
import './App.css';
import { MusicBox } from './domain/objects/MusicBox';
import { Awakening, Echostone, EchostoneColor } from './domain/objects';
import { Button, Card, CardContent, Container, FormControl, Input, InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';

export default function App() {
  const [echostone, setEchostone] = useState<Echostone>();
  const [advanceTaps, setAdvanceTaps] = useState(0);
  const [awakenTaps, setAwakenTaps] = useState(0);

  const [advanceRateBoost, setAdvanceRateBoost] = useState<number>(0);

  const [awakeningSelect, setAwakeningSelect] = useState<Awakening>();
  const [awakeningLevelInput, setAwakeningLevelInput] = useState<number>();

  const musicbox: MusicBox = new MusicBox('advanced');

  const color = !!echostone ? `${echostone.color} Echostone` : "Select an echo";
  const grade = !!echostone ? `G${echostone.grade} ` : "N/A";
  const stat = !!echostone ? `Stat: ${echostone.getTotalStats()}` : "Stat: N/A";
  const awakening = !!echostone && !!echostone.awakening ? `${echostone.awakening.name} ${echostone.awakening.level}` : "No awakening";

  const createEcho = (color: EchostoneColor) => {
    setEchostone(new Echostone(1, 1, color, undefined, undefined));
    setAdvanceTaps(0);
    setAwakenTaps(0);
    setAwakeningSelect(undefined);
    setAwakeningLevelInput(undefined);
  };

  const advance = () => {
    if (!!echostone) {
      const echo = echostone.advance(musicbox, advanceRateBoost);
      setEchostone(echo);
      setAdvanceTaps(advanceTaps + 1);
    }
  };

  const awaken = () => {
    if (!!echostone) {
      const newEcho = echostone.awaken(musicbox);
      setEchostone(newEcho);
      setAwakenTaps(awakenTaps + 1);
    }
  };

  const onRateBoostInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setAdvanceRateBoost(parseInt(event.target.value));
  };

  const tapUntilG30 = () => {
    let newEcho = echostone;
    let taps = 0;
    while (!!newEcho && newEcho.grade < Echostone.MAX_LEVEL) {
      newEcho = newEcho.advance(musicbox, advanceRateBoost);
      taps++;
    }

    setEchostone(newEcho);
    setAdvanceTaps(advanceTaps + taps);
  };

  const onAwakeningSelect = (event: SelectChangeEvent<string>) => {
    if (!!echostone) {
      const awakening = musicbox.getAwakenings(echostone.color).awakenings
        .find(awakening => awakening.name === event.target.value);

      setAwakeningSelect(awakening);
    }
  };

  const onAwakeningLevelInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setAwakeningLevelInput(parseInt(event.target.value));
  };

  const fishForAwakening = () => {
    let newEcho = echostone;
    let taps = 0;
    while (!!newEcho && !!awakeningSelect && !!awakeningLevelInput && 
          ((!!newEcho.awakening && (newEcho.awakening.name !== awakeningSelect.name || newEcho.awakening.level < awakeningLevelInput)) || !newEcho.awakening)) {
      newEcho = newEcho.awaken(musicbox);
      taps++;
    }

    setEchostone(newEcho);
    setAwakenTaps(awakenTaps + taps);
  };

  return (
    <Container maxWidth="md" sx={{ m: 'auto' }}>
      <Stack spacing={2} alignItems="center" justifyContent="center" direction="column">
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h3" component="div">
              {color}
            </Typography>
            <Typography variant="h5" component="div">
              {grade}
            </Typography>
            <Typography variant="h5" component="div">
              {stat}
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary" gutterBottom>
              {awakening}
            </Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary">
              {`Advance Taps: ${advanceTaps}    Awaken Taps: ${awakenTaps}`}
            </Typography>
          </CardContent>
        </Card>
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Button variant="contained" onClick={() => createEcho("Red")}>Red Echostone</Button>
            <Button variant="contained" onClick={() => createEcho("Yellow")}>Yellow Echostone</Button>
            <Button variant="contained" onClick={() => createEcho("Blue")}>Blue Echostone</Button>
            <Button variant="contained" onClick={() => createEcho("Silver")}>Silver Echostone</Button>
            <Button variant="contained" onClick={() => createEcho("Black")}>Black Echostone</Button>
          </Stack>
          <Input
              id="rate-boost-input"
              value={awakeningLevelInput}
              onChange={onRateBoostInput}
              type="number"
              placeholder="Enter rate boost %"
              size="small"
              sx={{ width: 200 }}
              
              endAdornment={<InputAdornment position='end'>%</InputAdornment>}
              error={!!awakeningSelect && !!awakeningLevelInput && awakeningLevelInput > parseInt(awakeningSelect.maxLevel)}
          />
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Button variant="contained" onClick={advance}>Advance Echostone</Button>
            <Button variant="contained" onClick={awaken}>Awaken Echostone</Button>
          </Stack>
          <Stack spacing={1} justifyContent="center" alignItems="center">
            <Button variant="contained" onClick={tapUntilG30}>Tap Until G30</Button>
          </Stack>
          <Stack spacing={1} direction="row" justifyContent="center">
            <FormControl size="small">
              <InputLabel>Select awakening</InputLabel>
              <Select
                labelId="echostone-awakening-select"
                id="echostone-awakening-select"
                value={!!awakeningSelect ? awakeningSelect.name : ""}
                label="Select awakening"
                onChange={onAwakeningSelect}
                sx={{ width: 200 }}
              >
                {!!echostone && musicbox.getAwakenings(echostone.color).awakenings.map(awakening => (
                  <MenuItem value={awakening.name}>
                    {awakening.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Input
              id="echostone-awakening-target-level"
              value={awakeningLevelInput}
              onChange={onAwakeningLevelInput}
              type="number"
              placeholder="Enter min level"
              error={!!awakeningSelect && !!awakeningLevelInput && awakeningLevelInput > parseInt(awakeningSelect.maxLevel)}
            />
            <Button variant="contained" onClick={fishForAwakening}>Fish for Awakening</Button>
          </Stack>
          <Typography>

          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
