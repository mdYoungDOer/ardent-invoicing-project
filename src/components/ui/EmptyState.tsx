'use client';

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'success' | 'error';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'success' | 'error';
  };
  tips?: string[];
  illustration?: ReactNode;
  maxWidth?: number;
  height?: number | string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tips = [],
  illustration,
  maxWidth = 400,
  height = 'auto'
}: EmptyStateProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height,
        p: 3,
        textAlign: 'center'
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: 0.2, 
          type: "spring", 
          stiffness: 200,
          damping: 20
        }}
        style={{ maxWidth }}
      >
        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
            border: `1px solid ${theme.palette.divider}`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
              zIndex: 0
            }}
          />

          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            {/* Icon */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3
                }}
              >
                {icon}
              </Box>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                fontWeight="bold"
                gutterBottom
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                {title}
              </Typography>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 320, mx: 'auto' }}
              >
                {description}
              </Typography>
            </motion.div>

            {/* Actions */}
            {(action || secondaryAction) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Stack
                  direction={isMobile ? 'column' : 'row'}
                  spacing={2}
                  justifyContent="center"
                  sx={{ mb: tips.length > 0 ? 3 : 0 }}
                >
                  {action && (
                    <Button
                      variant={action.variant || 'contained'}
                      color={action.color || 'primary'}
                      onClick={action.onClick}
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: theme.shadows[4],
                        '&:hover': {
                          boxShadow: theme.shadows[8],
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      {action.label}
                    </Button>
                  )}

                  {secondaryAction && (
                    <Button
                      variant={secondaryAction.variant || 'outlined'}
                      color={secondaryAction.color || 'primary'}
                      onClick={secondaryAction.onClick}
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {secondaryAction.label}
                    </Button>
                  )}
                </Stack>
              </motion.div>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Quick Tips:
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {tips.map((tip, index) => (
                      <Chip
                        key={index}
                        label={tip}
                        size="small"
                        variant="outlined"
                        sx={{
                          mb: 1,
                          '& .MuiChip-label': {
                            fontSize: '0.75rem'
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Illustration */}
        {illustration && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ marginTop: 24 }}
          >
            {illustration}
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
}
