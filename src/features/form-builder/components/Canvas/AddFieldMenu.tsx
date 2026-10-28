import { useCallback, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from "@mui/material/OutlinedInput";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import {
  createFieldFromType,
  insertField,
  isFullWidth,
  type FieldType,
} from "../../../form-schema";
import { useFormBuilderActions } from "../../context/useFormBuilderContext";
import { usePaletteGroups } from "../../hooks/usePaletteGroup";

type AddFieldMenuProps = {
  /** Field the new one is inserted relative to. */
  anchorId: string;
  /** The "+" button. The menu opens next to it. */
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

/**
 * Menu for choosing which field to insert. It renders in a portal above the whole page,
 * so the canvas's scroll container can't clip it or push the layout around, and it keeps
 * itself inside the viewport (flipping above the button when there is no room below).
 */
export const AddFieldMenu = ({ anchorId, anchorEl, onClose }: AddFieldMenuProps) => {
  const { setFields } = useFormBuilderActions();
  const [query, setQuery] = useState("");
  const { groups: allGroups } = usePaletteGroups(query);
  // Full-width elements (headings, dividers, alerts) can't sit beside another field.
  const groups = useMemo(
    () =>
      allGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => !isFullWidth(item.type)),
        }))
        .filter((group) => group.items.length > 0),
    [allGroups],
  );

  const handleAdd = useCallback(
    (type: FieldType) => {
      setFields((prev) =>
        insertField(prev, createFieldFromType(type, prev), {
          anchorId,
          placement: "beside",
        }),
      );
      onClose();
    },
    [anchorId, onClose, setFields],
  );

  return (
    <Popover
      open
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      marginThreshold={12}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-label": "Add a field",
          elevation: 8,
          sx: {
            mt: 1,
            width: "min(18rem, calc(100vw - 1.5rem))",
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
          },
        },
      }}
    >
      <div className="border-line border-b p-2">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", px: 0.5, pb: 0.75 }}
        >
          Adding beside this field
        </Typography>
        <OutlinedInput
          autoFocus
          fullWidth
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search fields"
          inputProps={{ "aria-label": "Search fields" }}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          }
        />
      </div>

      <div className="max-h-[min(18rem,50vh)] overflow-y-auto p-1">
        {groups.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 3, textAlign: "center" }}
          >
            No fields match “{query.trim()}”
          </Typography>
        ) : (
          groups.map((group) => (
            <section key={group.id}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  px: 1.5,
                  pt: 1.25,
                  pb: 0.5,
                  fontWeight: 600,
                }}
              >
                {group.label}
              </Typography>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <ListItemButton
                    key={item.id}
                    dense
                    onClick={() => handleAdd(item.type)}
                    sx={{ borderRadius: 1, gap: 0.5, minHeight: 40 }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: "primary.main" }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      slotProps={{
                        primary: { variant: "body2" },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </section>
          ))
        )}
      </div>
    </Popover>
  );
};
