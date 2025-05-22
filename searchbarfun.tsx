import { useState, useMemo, KeyboardEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  TextField, Paper, List, ListItemButton, ListItemIcon,
  ListItemText, Box, Typography
} from '@mui/material';
import LocationCityIcon    from '@mui/icons-material/LocationCity'; // ← list-1
import PublicIcon          from '@mui/icons-material/Public';       // ← list-2
import LinkOffIcon         from '@mui/icons-material/LinkOff';

const LIST_NJ = ['Atlantic City', 'Cape May', 'Hoboken', 'Trenton', 'Princeton'];
const LIST_NY = ['Albany', 'Buffalo', 'Ithaca', 'Rochester', 'Syracuse', 'Yonkers'];

type Entry = { name: string; list: 'NJ' | 'NY' };

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);

  const matches: Entry[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const fromNj = LIST_NJ.filter(n => n.toLowerCase().includes(q))
                          .map(name => ({ name, list: 'NJ' }));
    const fromNy = LIST_NY.filter(n => n.toLowerCase().includes(q))
                          .map(name => ({ name, list: 'NY' }));
    return [...fromNj, ...fromNy].slice(0, 7);          // cap at seven
  }, [query]);

  const handleKeys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!matches.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(i => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(i => (i - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter') {
      const chosen = matches[highlight];
      if (chosen) {
        window.location.href = `/${chosen.list}/${encodeURIComponent(chosen.name)}`;
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', width: 320, mx: 'auto' }}>
      <TextField
        fullWidth
        size="small"
        label="Search…"
        value={query}
        onChange={e => { setQuery(e.target.value); setHighlight(0); }}
        onKeyDown={handleKeys}
      />

      {matches.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%', mt: 1, width: '100%',
            maxHeight: 280,                // ≈ 7 × 40 px rows
            overflowY: 'auto', zIndex: 10,
          }}
        >
          <List disablePadding>
            {matches.map((m, idx) => (
              <ListItemButton
                key={m.list + m.name}
                component={RouterLink}
                to={`/${m.list}/${m.name}`}
                selected={idx === highlight}
                onClick={() => setQuery('')}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {m.list === 'NJ' ? <LocationCityIcon /> : <PublicIcon />}
                </ListItemIcon>
                <ListItemText primary={m.name} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      {query && matches.length === 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <LinkOffIcon color="error" />
          <Typography color="error">No match</Typography>
        </Box>
      )}
    </Box>
  );
}