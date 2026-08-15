import { KeyframePoint } from '../../features/graph-editor/types';

export type ExportHostTarget =
  | 'premiere-uxp'
  | 'after-effects-jsx'
  | 'davinci-fusion-lua'
  | 'final-cut-fcpxml'
  | 'blender-python'
  | 'react-framer-motion'
  | 'vanilla-css'
  | 'gsap-timeline';

export class UniversalExporterEngine {
  /**
   * Generates production-ready script or configuration code for the chosen host application.
   */
  static generateHostCode(
    target: ExportHostTarget,
    keyframes: KeyframePoint[],
    propertyName = 'PositionX',
    layerName = 'MotionLayer'
  ): string {
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);

    switch (target) {
      case 'premiere-uxp': {
        return JSON.stringify(
          {
            generator: 'Motion Studio Universal Bridge',
            version: '2.0.0',
            host: 'premierepro',
            minVersion: '25.6.0',
            layerName,
            propertyName,
            keyframes: sorted.map((k) => ({
              timeSeconds: k.time / 100,
              value: k.value,
              interpolation: k.type === 'bezier' ? 'BEZIER' : 'LINEAR',
            })),
          },
          null,
          2
        );
      }

      case 'after-effects-jsx': {
        let jsx = `// Motion Studio After Effects ExtendScript Exporter\n`;
        jsx += `(function() {\n`;
        jsx += `  app.beginUndoGroup("Apply Motion Studio Keyframes");\n`;
        jsx += `  var comp = app.project.activeItem;\n`;
        jsx += `  if (comp && comp.selectedLayers.length > 0) {\n`;
        jsx += `    var layer = comp.selectedLayers[0];\n`;
        jsx += `    var prop = layer.property("Transform").property("${propertyName}");\n`;
        sorted.forEach((k) => {
          jsx += `    prop.setValueAtTime(${k.time / 100}, ${k.value});\n`;
        });
        jsx += `  }\n`;
        jsx += `  app.endUndoGroup();\n`;
        jsx += `})();\n`;
        return jsx;
      }

      case 'davinci-fusion-lua': {
        let lua = `-- Motion Studio DaVinci Resolve Fusion Spline Exporter\n`;
        lua += `local tool = comp:FindTool("${layerName}")\n`;
        lua += `if tool then\n`;
        lua += `  local spline = tool.${propertyName}\n`;
        sorted.forEach((k) => {
          lua += `  spline:SetKey(${k.time}, ${k.value})\n`;
        });
        lua += `end\n`;
        return lua;
      }

      case 'final-cut-fcpxml': {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<!DOCTYPE fcpxml>\n`;
        xml += `<fcpxml version="1.10">\n`;
        xml += `  <resources>\n    <format id="r1" name="FFVideoFormat1080p60" frameDuration="1/60s" width="1920" height="1080"/>\n  </resources>\n`;
        xml += `  <library>\n    <event name="Motion Studio Export">\n      <project name="${layerName}">\n`;
        xml += `        <sequence format="r1" duration="${sorted[sorted.length - 1]?.time || 100}/60s">\n`;
        xml += `          <spine>\n            <title name="${layerName}" duration="100/60s">\n`;
        sorted.forEach((k) => {
          xml += `              <param name="${propertyName}" key="${k.time}" value="${k.value}"/>\n`;
        });
        xml += `            </title>\n          </spine>\n        </sequence>\n      </project>\n    </event>\n  </library>\n`;
        xml += `</fcpxml>\n`;
        return xml;
      }

      case 'blender-python': {
        let py = `# Motion Studio Blender Python F-Curve Exporter\n`;
        py += `import bpy\n\n`;
        py += `obj = bpy.context.active_object\n`;
        py += `if obj and obj.animation_data:\n`;
        py += `    action = obj.animation_data.action\n`;
        py += `    fcurve = action.fcurves.new(data_path="${propertyName.toLowerCase()}", index=0)\n`;
        sorted.forEach((k) => {
          py += `    kf = fcurve.keyframe_points.insert(frame=${k.time}, value=${k.value})\n`;
          py += `    kf.interpolation = 'BEZIER'\n`;
        });
        return py;
      }

      case 'react-framer-motion': {
        const times = sorted.map((k) => (k.time / 100).toFixed(2));
        const values = sorted.map((k) => k.value);
        return `// Motion Studio React Framer Motion Component
import { motion } from 'framer-motion';

export function ${layerName}Component() {
  return (
    <motion.div
      animate={{
        ${propertyName.toLowerCase()}: [${values.join(', ')}],
      }}
      transition={{
        duration: ${(sorted[sorted.length - 1]?.time || 100) / 100},
        times: [${times.join(', ')}],
        ease: 'easeInOut',
      }}
    />
  );
}
`;
      }

      case 'vanilla-css': {
        let css = `@keyframes ${layerName}_anim {\n`;
        sorted.forEach((k) => {
          const pct = Math.round((k.time / (sorted[sorted.length - 1]?.time || 100)) * 100);
          css += `  ${pct}% { transform: translate3d(${k.value}px, 0, 0); }\n`;
        });
        css += `}\n`;
        return css;
      }

      case 'gsap-timeline': {
        let gsap = `// Motion Studio GSAP Timeline Exporter\n`;
        gsap += `const tl = gsap.timeline();\n`;
        sorted.forEach((k) => {
          gsap += `tl.to(".${layerName}", { ${propertyName.toLowerCase()}: ${k.value}, duration: 0.3, ease: "power2.out" }, "${k.time / 100}s");\n`;
        });
        return gsap;
      }
    }
  }
}
