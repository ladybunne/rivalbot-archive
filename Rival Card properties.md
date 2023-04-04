Rival Card properties

Tagline: simple string on Rival table, set a character limit so people don't do stupid stuff with it.

Start Date: set via a slash command, also on Rival table. Store as a Unix timestamp.

Lifetime Coins: derived from existing coin infrastructure.

Tournament PB: This one will need some work. 
    In essence it's pretty simple: submit a number just like coins and it'll do a TournamentUpdate.
    This can get leaderboarded or queried for most recent entry.
        (As a side tangent, doing events feed style update pings might get a bit chaotic in the time period immediately after a tournament ends. Possibly have a grace window for updates?)
    This is simple and doable. Not even any number fuckery since wave counts are pretty small, relatively.
    Where it gets fiddly is with versions. The game's versions are erratic and can't really be derived from time periods, since different people have different update rollout windows.
    The intent is for new versions that have significantly breaking changes for tournament metas / performances will "stale" old ones.
    The exact method for determining which versions stale and which ones don't is unclear.
        *** This requires some discussion.
        All versions?
            Probably too all-encompassing, but maybe viable given Fudds' update schedule (lol).
        Community-agreed versions?
            *** Requires a lot of discussion.
            Might be more doable. Really depends on the game and how volatile each version is.
            This could actually give us a nice vector for discussing upcoming or past versions...
            Maybe I need a way to retroactively stale a version. That should actually be pretty doable.
        Only ones where the main server wipes tournament roles?
            Easy to implement, but might not suit the needs of the community.
    What about how to get that data into the system?
        A slash command that's only runnable by me would probably work.
        Parameters are version string (v0.18.21), rollout date, willStale boolean.
        Oh god, this needs to be a fucking database table, doesn't it?!
    How will stale entries on the leaderboard be handled?
    What if an infrequently-active player submits an incredible score, holding first place, then its version is staled?
        Should it be marked as stale? (Yes, probably.)
        Should it be excluded from rankings?
            Rankings could actually sort non-stale entries above stale ones. I actually like this solution a lot.
    What's to stop people from re-entering their scores simply to clear the staleness from them?
        The honour system, probably.
        *** This warrants a discussion.
    Assuming that the following works...
        Champ wave submissions (everyone)
        Game version submissions (me)
        Champ wave leaderboard (no staling)
        Staling indicator and sorting added to leaderboards
    I _think_ this would be feature-complete.

Tournament Strategy: Easy multiple choice.
    WAWSIS, Demote, Blender, Devo, GC, Unspecified.
    Specifically have Unspecified as a selectable option, and have it be a default.
    Do it with enums.

Workshop: Hoo boy. Another fun one.
    This one represents tracking people's Damage/Health/Absdev workshop upgrade levels.
    This could simply be three numbers stored on the Rival table.
    I guess it depends if people want a history of workshop stats?
    If they don't, easy table column.
    If they do...
        Have a new table for WorkshopUpdates.
            At this point it's beginning to look like I may want to consider a more universal, extensible method of submitting data.
            This pattern is cropping up in a few places and it could be cool / useful to solve it consistently.
            Maybe have a RivalUpdate object, have _it_ have a few child objects depending on the domain.
                Tournament, Workshop, UltimateWeapons are all obvious.
                Account could have things like lifetime coins, start date, purchases.
                Maybe have one for Events, to track bot stats and maybe event skins.
                Account could also have milestone rewards? Maybe put cosmetics on Account. idfk.
            I like this structure, since it's really extensible.
            I'd have to think carefully about how to structure the database side.
            It could be one class/type/object in TypeScript, but it may need to be processed and split into multiple different table updates.
            *** This one warrants some careful thought about how best to future proof this process.
    Anyway. A solution path exists as needed for this. If not, maybe we could just leave it.

Ultimate Weapons: Similar deal to workshop stats.
    If history is not required, easy, have "Ultimate Weapons" be a column on the Rival table.
    The pragmatic way to future-proof this is to have a table of ultimate weapons.
    Then make the column a "multi-select" dealio where people have arbitrary sets between 0 and all ultimate weapons as the value in that column.
    This means future columns do not need to be created in the event that more weapons are added (likely).
    Nor does it mean columns need to be renamed if they are renamed in the game. 
    If history _is_ required...
        People probably only care about the dates when they _got_ an ultimate weapon, so the modelling for that is actually pretty doable.
        It might be nice from an account milestone perspective.

TANGENT ALERT!
 Oh fuck, I just had a great idea.
TANGENT ALERT!

RivalBot could have agreed-upon account milestones!
They could be built up like a history, sort of like Smash Ultimate's "you played 600 battles!" things that it does.
These could be stored in the Rival Card thread, edited into a second embed that gets edited to show milestones in most-to-least recent, chronologically.
Something like "Finished upgrading CF!" would be a cool one.
Same deal with "Cleared Champ XXXX", or "Broke X.X lifetime coins!"
I think this is a great way of celebrating people's accomplishments over time...
...as well as providing a neat way of doing metrics on how long it took players to hit different milestones.
(Obviously whaling is something to consider here.)
I think there's a lot of promise in this direction. It'd also help combat people comparing themselves to players who are _much_ further ahead than them.

TANGENT OVER
 Thank god.
TANGENT OVER

        Anyway, the implementation of UW history.
        It's probably just an UltimateWeaponsUpdate, which is a rival id, 