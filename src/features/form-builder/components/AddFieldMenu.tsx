import { useCallback, useLayoutEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import OutlinedInput from "@mui/material/OutlinedInput";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  createFieldFromType,
  insertField,
  type FieldType,
} from "../../form-schema";
import { useFormBuilderContext } from "../context/useFormBuilderContext";
import { usePaletteGroups } from "../hooks/usePaletteGroup";

type AddFieldMenuProps = {
  /** Field the new one is inserted relative to. */
  anchorId: string;
  placement: "below" | "beside";
  onClose: () => void;
};

const HORIZONTAL_POSITION = {
  below: "left-1/2 -translate-x-1/2",
  beside: "start-0",
} as const;

const CONTEXT_LABEL = {
  below: "Adding below this row",
  beside: "Adding beside this field",
} as const;

/**
 * Dropdown for choosing which field to insert.
 * Must be rendered inside a `relative` element that wraps the "+" button.
 */
export const AddFieldMenu = ({
  anchorId,
  placement,
  onClose,
}: AddFieldMenuProps) => {
  const { setFields } = useFormBuilderContext();
  const [query, setQuery] = useState("");
  const { groups } = usePaletteGroups(query);

  // Open upwards when there is no room below (e.g. the last row on screen).
  const paperRef = useRef<HTMLDivElement | null>(null);
  const [openUp, setOpenUp] = useState(false);
  useLayoutEffect(() => {
    const element = paperRef.current;
    if (
      element &&
      element.getBoundingClientRect().bottom > window.innerHeight - 8
    ) {
      setOpenUp(true);
    }
  }, []);

  const handleAdd = useCallback(
    (type: FieldType) => {
      const nextField = createFieldFromType(type);
      setFields((prev) =>
        insertField(prev, nextField, { anchorId, placement }),
      );
      onClose();
    },
    [anchorId, placement, onClose, setFields],
  );

  return (
    <Paper
      ref={paperRef}
      elevation={8}
      role="dialog"
      aria-label="Add a field"
      className={`absolute z-10 w-64 overflow-hidden ${
        openUp ? "bottom-full mb-2" : "top-full mt-2"
      } ${HORIZONTAL_POSITION[placement]}`}
      sx={{ border: 1, borderColor: "divider", borderRadius: 1.5 }}
    >
      <div className="border-line border-b p-2">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", px: 0.5, pb: 0.75 }}
        >
          {CONTEXT_LABEL[placement]}
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

      <div className="max-h-72 overflow-y-auto p-1">
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
                    sx={{ borderRadius: 1, gap: 0.5 }}
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
    </Paper>
  );
};
