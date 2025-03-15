import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'


export async function GET(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient()

    const { data, error } = await (await supabase)
        .from('community_builds')
        .select('shareable_id, analysis_notes')
        .eq('shareable_id', params.id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        id: data.shareable_id,
        hasAnalysisNotes: !!data.analysis_notes,
        analysisNotesType: typeof data.analysis_notes,
        analysisNotes: data.analysis_notes
    })
} 