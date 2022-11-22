import React, { ChangeEvent, useState } from 'react';
import './App.css';
import { MusicBox } from './domain/objects/MusicBox';
import { Awakening, Difficulty, Echostone, EchostoneColor } from './domain/objects';
import { Button, Card, CardContent, Checkbox, Container, FormControl, FormControlLabel, FormGroup, FormLabel, Input, InputAdornment, InputLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent, Stack, Typography } from '@mui/material';

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('advanced');
  const [echostone, setEchostone] = useState<Echostone>();
  const [advanceTaps, setAdvanceTaps] = useState(0);
  const [awakenTaps, setAwakenTaps] = useState(0);
  const [supplementCount, setSupplementCount] = useState(0);

  const [advanceRateBoost, setAdvanceRateBoost] = useState<number>(0);

  const [useSupplements, setUseSupplements] = useState(false);
  const [maxAutoAdvanceGrade, setMaxAutoAdvanceGrade] = useState<number>();

  const [awakeningSelect, setAwakeningSelect] = useState<Awakening>();
  const [awakeningLevelInput, setAwakeningLevelInput] = useState<number>();

  const musicbox: MusicBox = new MusicBox(difficulty);

  const color = !!echostone ? `${echostone.color} Echostone` : "Select an echo";
  const grade = !!echostone ? `G${echostone.grade} ` : "N/A";

  const prevRate = !!echostone && !!musicbox.getAdvancementRate(echostone.grade - 1) ? musicbox.getAdvancementRate(echostone.grade - 1) : undefined;
  const rate = !!echostone && !!musicbox.getAdvancementRate(echostone.grade) ? musicbox.getAdvancementRate(echostone.grade) : undefined;
  const stat = !!echostone ? `Stat: ${echostone.getTotalStats()} (+${echostone.stat} / ${!!prevRate ? prevRate.maxGain : 1})` : "Stat: N/A";
  const awakening = !!echostone && !!echostone.awakening ? `${echostone.awakening.name} ${echostone.awakening.level}` : "No awakening";

  const onDifficultyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDifficulty(event.target.value as Difficulty);
  }

  const createEcho = (color: EchostoneColor) => {
    setEchostone(new Echostone(1, 1, color, undefined, undefined));
    setAdvanceTaps(0);
    setAwakenTaps(0);
    setSupplementCount(0);
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

  const supplement = () => {
    if (!!echostone && echostone.grade >= Echostone.MIN_SUPPLEMENT_GRADE && echostone.grade <= Echostone.MAX_SUPPLEMENT_GRADE) {
      const newEcho = echostone.applySupplement(musicbox);
      setEchostone(newEcho);
      setSupplementCount(supplementCount + 1)
    }
  }

  const onRateBoostInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setAdvanceRateBoost(parseInt(event.target.value));
  };

  const onMaxAutoAdvanceGradeInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMaxAutoAdvanceGrade(parseInt(event.target.value));
  };

  const onUseSupplementsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUseSupplements(event.target.checked);
  };

  const tapUntilG30 = () => {
    let newEcho = echostone;
    let taps = 0;
    let supplementTaps = 0

    const maxGrade = Math.min(!!maxAutoAdvanceGrade ? maxAutoAdvanceGrade : Echostone.MAX_GRADE, Echostone.MAX_GRADE);
    while (!!newEcho && newEcho.grade < maxGrade) {
      newEcho = newEcho.advance(musicbox, advanceRateBoost);
      taps++;

      const rate = musicbox.getAdvancementRate(newEcho.grade - 1);
      const maxGain = !!rate ? rate.maxGain : undefined;
      while (useSupplements && !!maxGain && newEcho.grade <= Echostone.MAX_SUPPLEMENT_GRADE && newEcho.stat < maxGain) {
        newEcho = newEcho.applySupplement(musicbox);
        supplementTaps++;
      }
    }

    setEchostone(newEcho);
    setAdvanceTaps(advanceTaps + taps);
    setSupplementCount(supplementCount + supplementTaps);
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
              {`Advance Taps: ${advanceTaps}    Awaken Taps: ${awakenTaps}    Supplement Count: ${supplementCount}`}
            </Typography>
          </CardContent>
        </Card>
        <FormControl>
          <FormLabel id="difficulty-radio-buttons-group-label">Select Water Park Difficulty</FormLabel>
          <RadioGroup
            row
            aria-labelledby="difficulty-radio-buttons-group-label"
            name="difficulty-radio-buttons-group"
            value={difficulty}
            onChange={onDifficultyChange}
          >
            <FormControlLabel value="basic" control={<Radio />} label="Basic" />
            <FormControlLabel value="intermediate" control={<Radio />} label="Intermediate" />
            <FormControlLabel value="advanced" control={<Radio />} label="Advanced" />
          </RadioGroup>
        </FormControl>
        <Stack spacing={2} alignItems="center" justifyContent="center">
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Button variant="contained" onClick={() => createEcho("Red")}>Red Echostone</Button>
            <Button variant="contained" onClick={() => createEcho("Yellow")}>Yellow Echostone</Button>
            <Button variant="contained" onClick={() => createEcho("Blue")}>Blue Echostone</Button>
            <Button variant="contained" onClick={() => createEcho("Silver")}>Silver Echostone</Button>
            <Button variant="contained" onClick={() => createEcho("Black")}>Black Echostone</Button>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Input
                id="rate-boost-input"
                value={advanceRateBoost}
                onChange={onRateBoostInput}
                type="number"
                placeholder="Enter rate boost %"
                size="small"
                sx={{ width: 200 }}
                endAdornment={<InputAdornment position='end'>%</InputAdornment>}
                error={!!awakeningSelect && !!awakeningLevelInput && awakeningLevelInput > parseInt(awakeningSelect.maxLevel)}
            />
            <Typography>
              {`Base rate: ${rate ? rate.rate : 100}% (+${advanceRateBoost}%)    Final rate: ${rate ? rate.rate + advanceRateBoost : 100}%`}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Button variant="contained" onClick={advance}>Advance Echostone</Button>
            <Button variant="contained" onClick={awaken}>Awaken Echostone</Button>
            <Button variant="contained" onClick={supplement}>Use Supplement</Button>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Input
                id="max-grade-input"
                value={maxAutoAdvanceGrade}
                onChange={onMaxAutoAdvanceGradeInput}
                type="number"
                placeholder="Autotap to Grade..."
                size="small"
                sx={{ width: 200 }}
                error={!!maxAutoAdvanceGrade && maxAutoAdvanceGrade > 30}
            />
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={useSupplements} onChange={onUseSupplementsChange}/>} label="Use Supplements" />
            </FormGroup>
            <Button variant="contained" onClick={tapUntilG30}>Auto Advance</Button>
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
