import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { colors, typography } from '../styles/theme';
import { PanGestureHandler, State, PinchGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface Node {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

interface Edge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface KnowledgeGraphProps {
  graph: GraphData;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ graph }) => {
  const { nodes = [], edges = [] } = graph || {};
  
  // Use refs for node positions
  const nodePositions = useRef<Record<string, { x: number, y: number }>>({});
  
  // Animation values for pan and zoom
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  const width = Dimensions.get('window').width - 64;
  const height = 250;
  
  // Initialize node positions using a simple force-directed layout
  useEffect(() => {
    if (nodes.length === 0) return;
    
    // Initialize positions with a simple circle layout if not defined
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    nodes.forEach((node, i) => {
      if (node.x === undefined || node.y === undefined) {
        const angle = (i * 2 * Math.PI) / nodes.length;
        nodePositions.current[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      } else {
        nodePositions.current[node.id] = { x: node.x, y: node.y };
      }
    });
  }, [nodes, width, height]);
  
  // Handle pan gesture
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      translateX.value = withSpring(translateX.value);
      translateY.value = withSpring(translateY.value);
    },
  });
  
  // Handle pinch gesture
  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startScale = scale.value;
    },
    onActive: (event, ctx) => {
      scale.value = Math.max(0.5, Math.min(2, ctx.startScale * event.scale));
    },
    onEnd: () => {
      scale.value = withSpring(scale.value);
    },
  });
  
  // Animated style for the graph container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });
  
  // If no nodes, show empty state
  if (nodes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No knowledge graph data available yet.
        </Text>
      </View>
    );
  }
  
  return (
    <PinchGestureHandler
      onGestureEvent={pinchGestureHandler}
      onHandlerStateChange={() => {}}
    >
      <PanGestureHandler
        onGestureEvent={panGestureHandler}
        onHandlerStateChange={() => {}}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <Svg width={width} height={height}>
            <G>
              {/* Draw edges */}
              {edges.map((edge, i) => {
                const source = nodePositions.current[edge.source];
                const target = nodePositions.current[edge.target];
                
                if (!source || !target) return null;
                
                return (
                  <Line
                    key={`edge-${i}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={colors.primaryLight}
                    strokeWidth={2}
                    opacity={0.7}
                  />
                );
              })}
              
              {/* Draw nodes */}
              {nodes.map((node) => {
                const position = nodePositions.current[node.id];
                if (!position) return null;
                
                return (
                  <G key={node.id}>
                    <Circle
                      cx={position.x}
                      cy={position.y}
                      r={20}
                      fill={colors.primary}
                    />
                    <SvgText
                      x={position.x}
                      y={position.y}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fontSize={10}
                      fill={colors.onPrimary}
                    >
                      {node.label.substring(0, 8)}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </PanGestureHandler>
    </PinchGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default KnowledgeGraph;
