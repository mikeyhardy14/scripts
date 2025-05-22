// SearchBar.tsx
import { useState, useMemo } from 'react';
import {
  TextField, Paper, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Typography
} from '@mui/material';
import LocationCityIcon from '@mui/icons-material/LocationCity'; // list-1 icon
import PublicIcon       from '@mui/icons-material/Public';      // list-2 icon
import LinkOffIcon      from '@mui/icons-material/LinkOff';

const LIST_NJ = ['Atlantic City', 'Cape May', 'Hoboken', 'Trenton', 'Princeton'];
const LIST_NY = ['Albany', 'Buffalo', 'Ithaca', 'Rochester', 'Syracuse', 'Yonkers'];

type Entry = { name: string; list: 'NJ' | 'NY' };

export default function SearchBar() {
  const [query, setQuery] = useState('');

  const matches: Entry[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const fromNj = LIST_NJ.filter(n => n.toLowerCase().includes(q)).map(name => ({ name, list: 'NJ' }));
    const fromNy = LIST_NY.filter(n => n.toLowerCase().includes(q)).map(name => ({ name, list: 'NY' }));
    return [...fromNj, ...fromNy].slice(0, 7);
  }, [query]);

  return (
    <Box sx={{ position: 'relative', width: 320, mx: 'auto' }}>
      <TextField
        fullWidth
        size="small"
        label="Search…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {matches.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%', mt: 1, width: '100%',
            maxHeight: 280, overflowY: 'auto', zIndex: 10,
          }}
        >
          <List disablePadding>
            {matches.map(m => {
              const href = `/${m.list}/${encodeURIComponent(m.name)}`;
              return (
                <ListItemButton
                  key={m.list + m.name}
                  component="a"
                  href={href}
                  onClick={() => setQuery('')}   // clear search after click (optional)
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {m.list === 'NJ' ? <LocationCityIcon /> : <PublicIcon />}
                  </ListItemIcon>
                  <ListItemText primary={m.name} />
                </ListItemButton>
              );
            })}
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